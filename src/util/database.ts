import { Database } from "sql.js";
import Logger from "./logger";
import initSqlJs from "sql.js";

import useDatabaseConnectionStore, {
  DatabaseConnection,
} from "../databaseConnectionStore";
import { DatabaseSource } from "../query/queryStore";
import Papa from "papaparse";
import { DatabaseDefinition } from "../databaseDefinition/databaseDefinitionStore";
import { parseJson } from "./json";
import { TransformResult, Value } from "../types";
import { objectsToRows } from "./transform";
import * as postProcessCsv from "../codeExecution/postProcessCsv";
import * as postProcessJson from "../codeExecution/postProcessJson";

const dbLogger = new Logger("database");
const sqlLogger = new Logger("sql");

export type ColumnType = "integer" | "real" | "text";

export type ColumnDefinition = {
  sourceName: string;
  dbName: string;
  type: ColumnType;
};

type Rows = Value[][];

const init = async () => {
  // sql.js needs to fetch its wasm file, so we cannot immediately instantiate the database
  // without any configuration, initSqlJs will fetch the wasm files
  const SQL = await initSqlJs({
    locateFile: () =>
      import.meta.env.MODE === "production"
        ? "/sql-wasm.wasm?init"
        : "/node_modules/sql.js/dist/sql-wasm.wasm?init",
  });
  return SQL;
};

const initializeDbFromUrl = dbLogger.wrap(
  "initializeDbFromUrl",
  async (key: string) => {
    const SQL = await init();
    const res = await fetch("/" + key);
    const buf = await res.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buf));
    return db;
  }
);

const createDb = dbLogger.time(
  "initializeFromCsv",
  async (tableName: string, columns: ColumnDefinition[], csvContent: Rows) => {
    const SQL = await init();
    const db = new SQL.Database();
    await createTable(db, tableName, columns);
    await insertIntoTable(db, tableName, columns, csvContent);
    return db;
  }
);

const loadFromCsv = async (databaseDefinition: DatabaseDefinition) => {
  const result = Papa.parse<string[]>(databaseDefinition.csvContent);
  if (!databaseDefinition.enablePostProcessing) {
    return result.data;
  }

  const executionResult = await postProcessCsv.execute(
    databaseDefinition.postProcessingCode,
    { rows: result.data }
  );

  if (!executionResult.success) {
    throw new Error(executionResult.error.error.message);
  }

  return executionResult.returnValue;
};

const loadFromJson = async (databaseDefinition: DatabaseDefinition) => {
  const data = parseJson<TransformResult>(databaseDefinition.jsonContent);
  if (!databaseDefinition.enablePostProcessing) {
    return data;
  }

  const executionResult = await postProcessJson.execute(
    databaseDefinition.postProcessingCode,
    { data }
  );

  if (!executionResult.success) {
    throw new Error(executionResult.error.error.message);
  }

  return executionResult.returnValue;
};

const loadFromCode = async (databaseDefinition: DatabaseDefinition) => {
  const result = Papa.parse<string[]>(databaseDefinition.csvContent);
  return result.data;
};

export const initialize = async (
  databaseSource: DatabaseSource,
  databaseDefinition: DatabaseDefinition
) => {
  const key =
    databaseSource.type === "local" ? databaseSource.id : databaseSource.url;
  useDatabaseConnectionStore.setState((state) => {
    state.databases[key] = { key, status: "loading" };
  });

  let connection: DatabaseConnection;
  try {
    let db: Database;
    if (databaseSource.type === "remote") {
      db = await initializeDbFromUrl(databaseSource.url);
    } else {
      let rows: Rows;

      if (databaseDefinition.source === "csv") {
        rows = await loadFromCsv(databaseDefinition);
      } else if (databaseDefinition.source === "json") {
        const data = await loadFromJson(databaseDefinition);
        rows = [
          [], // Hack: Empty row as the header. The contents are ignored by createDb()
          ...objectsToRows(data, Object.keys(data[0]!)),
        ];
      } else if (databaseDefinition.source === "code") {
        rows = await loadFromCode(databaseDefinition);
      } else {
        throw new Error(
          `databaseSource.type "${databaseDefinition.source}" not supported`
        );
      }

      db = await createDb(
        databaseDefinition.tableName,
        databaseDefinition.columns,
        rows
      );
    }

    connection = { key, status: "loaded", db };
  } catch (err) {
    connection = { key, error: err as Error, status: "error" };
  }
  useDatabaseConnectionStore.setState((state) => {
    state.databases[key] = connection;
  });

  return connection;
};

export const createTable = (
  db: Database,
  tableName: string,
  columns: ColumnDefinition[]
) => {
  const createTableStatement = `
      create table ${tableName} (${columns.map(
    (col) => `${col.dbName} ${col.type}`
  )})`;
  sqlLogger.log(createTableStatement);
  db.exec(createTableStatement);
};

export const insertIntoTable = sqlLogger.time(
  "insertIntoTable",
  (
    db: Database,
    tableName: string,
    columns: ColumnDefinition[],
    records: Rows
  ) => {
    const insertStmt = `insert into ${tableName} (${columns.map(
      (col) => col.dbName
    )}) values (${columns.map(() => "?")})`;
    sqlLogger.log(insertStmt);

    const preparedStatement = db.prepare(insertStmt);
    for (const row of records.slice(1)) {
      preparedStatement.run(row.map((v) => (v === "" ? null : v)));
      preparedStatement.reset();
    }
    preparedStatement.free();
  }
);

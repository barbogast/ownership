import { Database } from "sql.js";
import Logger from "./logger";
import initSqlJs from "sql.js";

import useDatabaseConnectionStore, {
  DatabaseConnection,
} from "../databaseConnectionStore";
import { DatabaseSource } from "../query/queryStore";
import {
  DatabaseDefinition,
  IMPORTED_FROM_CODE_FILE_NAME,
  JsonContent,
} from "../databaseDefinition/databaseDefinitionStore";
import { DataRow, TransformResult } from "../types";
import { rowsToObjects } from "./transform";
import * as postProcessCsv from "../codeExecution/postProcessCsv";
import * as postProcessJson from "../codeExecution/postProcessJson";
import * as csv from "./csv";
import * as json from "./json";

const dbLogger = new Logger("database");
const sqlLogger = new Logger("sql");

export type ColumnType = "integer" | "real" | "text";

export type ColumnDefinition = {
  sourceName: string;
  dbName: string;
  type: ColumnType;
};

export type DbSchema = {
  version: string;
  tables: {
    name: string;
    columns: {
      name: string;
      type: string;
    }[];
  }[];
};

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
  async (
    tableName: string,
    columns: ColumnDefinition[],
    csvContent: TransformResult
  ) => {
    const SQL = await init();
    const db = new SQL.Database();
    await createTable(db, tableName, columns);
    await insertIntoTable(db, tableName, columns, csvContent);
    return db;
  }
);

const loadFromCsv = async (databaseDefinition: DatabaseDefinition) => {
  const files = csv.parseSourceFiles(databaseDefinition.sourceFiles);
  if (!databaseDefinition.enablePostProcessing) {
    return csv.mergeFiles(files);
  }

  const executionResult = await postProcessCsv.execute(
    databaseDefinition.postProcessingCode,
    { files }
  );

  if (!executionResult.success) {
    throw new Error(executionResult.error.error.message);
  }

  return executionResult.returnValue;
};

const loadFromJson = async (databaseDefinition: DatabaseDefinition) => {
  const files = json.parseSourceFiles(databaseDefinition.sourceFiles);

  if (!databaseDefinition.enablePostProcessing) {
    return json.mergeFiles<DataRow>(files);
  }

  const executionResult = await postProcessJson.execute(
    databaseDefinition.postProcessingCode,
    { files }
  );

  if (!executionResult.success) {
    throw new Error(executionResult.error.error.message);
  }

  return executionResult.returnValue;
};

const loadFromCode = async (databaseDefinition: DatabaseDefinition) =>
  json.parseJson<JsonContent>(
    databaseDefinition.sourceFiles[IMPORTED_FROM_CODE_FILE_NAME]!
  );

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
      let rows: TransformResult;

      if (databaseDefinition.source === "csv") {
        rows = csv.arraysToObjects(await loadFromCsv(databaseDefinition));
      } else if (databaseDefinition.source === "json") {
        rows = await loadFromJson(databaseDefinition);
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

    const schema = querySchema(db);
    connection = { key, status: "loaded", db, schema };
  } catch (err) {
    console.error(err);
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
    records: TransformResult
  ) => {
    const insertStmt = `insert into ${tableName} (${columns.map(
      (col) => col.dbName
    )}) values (${columns.map(() => "?")})`;
    sqlLogger.log(insertStmt);

    const preparedStatement = db.prepare(insertStmt);
    for (const row of records) {
      preparedStatement.run(
        columns.map((col) => {
          const v = row[col.sourceName]!;
          return v === "" ? null : v;
        })
      );
      preparedStatement.reset();
    }
    preparedStatement.free();
  }
);

const querySchema = sqlLogger.time("querySchema", (db: Database) => {
  const versionResult = db.exec("select sqlite_version()");
  const version = versionResult[0]!.values[0]![0] as string;

  const tableResult = db.exec("select * from sqlite_master");
  const tables = rowsToObjects(tableResult[0]!);

  const dbSchema: DbSchema = { tables: [], version };
  for (const table of tables) {
    const columnResult = db.exec(`pragma table_info('${tables[0]!.name}')`);
    const columns = rowsToObjects(columnResult[0]!);
    dbSchema.tables.push({
      name: table.name,
      columns: columns.map((column) => ({
        name: column.name,
        type: column.type,
      })),
    });
  }

  return dbSchema;
});

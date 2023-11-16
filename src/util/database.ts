import { Database } from "sql.js";
import Logger from "./logger";
import { CsvRecords } from "./csv";
import initSqlJs from "sql.js";

import useDatabaseConnectionStore, {
  DatabaseConnection,
} from "../databaseConnectionStore";
import { DatabaseSource } from "../query/queryStore";
import Papa from "papaparse";
import { DatabaseDefinition } from "../databaseDefinition/databaseDefinitionStore";

const dbLogger = new Logger("database");
const sqlLogger = new Logger("sql");

export type ColumnType = "integer" | "real" | "text";

export type ColumnDefinition = {
  sourceName: string;
  dbName: string;
  type: ColumnType;
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

const initializeDbFromCsv = dbLogger.time(
  "initializeFromCsv",
  async (
    tableName: string,
    columns: ColumnDefinition[],
    csvContent: CsvRecords
  ) => {
    const SQL = await init();
    const db = new SQL.Database();
    await createTable(db, tableName, columns);
    await insertIntoTable(db, tableName, columns, csvContent);
    return db;
  }
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
      const result = Papa.parse<string[]>(databaseDefinition.csvContent);
      db = await initializeDbFromCsv(
        databaseDefinition.tableName,
        databaseDefinition.columns,
        result.data
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
    records: CsvRecords
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

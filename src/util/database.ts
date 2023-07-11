import { Database } from "sql.js";
import Logger from "./logger";
import { CsvRecords, analyzeCsvHeader } from "./csv";
import initSqlJs from "sql.js";

import useDatabaseConnectionStore, {
  DatabaseConnection,
} from "../databaseConnectionStore";
import { DatabaseSource } from "../query/queryStore";
import Papa from "papaparse";

const dbLogger = new Logger("database");
const sqlLogger = new Logger("sql");

export type ColumnDefinition = {
  csvName: string;
  dbName: string;
  csvIndex: number;
  type: "integer" | "real" | "text";
};

const isLocal =
  window.location.host.startsWith("127.0.0.1") ||
  window.location.host.startsWith("localhost");

const init = async () => {
  // sql.js needs to fetch its wasm file, so we cannot immediately instantiate the database
  // without any configuration, initSqlJs will fetch the wasm files
  const SQL = await initSqlJs({
    locateFile: () =>
      isLocal
        ? "/node_modules/sql.js/dist/sql-wasm.wasm?init"
        : "/sql-wasm.wasm?init",
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
  async (columns: ColumnDefinition[], csvContent: CsvRecords) => {
    const SQL = await init();
    const db = new SQL.Database();
    await createTable(db, "aaa", columns);
    await insertIntoTable(db, "aaa", columns, csvContent);
    return db;
  }
);

export const initialize = async (
  databaseSource: DatabaseSource,
  csvContent: string
) => {
  useDatabaseConnectionStore.setState((state) => {
    state.databases[databaseSource.url] = {
      key: databaseSource.url,
      status: "loading",
    };
  });

  let connection: DatabaseConnection;
  const key = databaseSource.url;
  try {
    let db: Database;
    if (databaseSource.type === "remote") {
      db = await initializeDbFromUrl(databaseSource.url);
    } else {
      const result = Papa.parse<string[]>(csvContent);
      const columns = analyzeCsvHeader(result.data);
      db = await initializeDbFromCsv(columns, result.data);
    }
    connection = { key, status: "loaded", db };
  } catch (err) {
    connection = { key, error: err as Error, status: "error" };
  }
  useDatabaseConnectionStore.setState((state) => {
    state.databases[key] = connection;
  });
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

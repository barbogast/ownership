import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import initSqlJs, { Database } from "sql.js";
import Logger from "./util/logger";

const logger = new Logger("database");

export type { Database, QueryExecResult } from "sql.js";

// Note: key may be a
// - fileName in case the DB was populated from a file or a
// - UUID if it was created blank

export type MyDatabase =
  | {
      key: string;
      status: "loading";
    }
  | {
      key: string;
      status: "loaded";
      db: Database;
    }
  | {
      key: string;
      status: "error";
      error: Error;
    };

type State = {
  databases: { [fileName: string]: MyDatabase };
};

const initialState = { databases: {} };

const useDatabaseStore = create(immer<State>(() => initialState));

export default useDatabaseStore;

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

export const initializeDb = logger.wrap(
  "initializeDb",
  async (key: string, keyIsFileName: boolean) => {
    let myDb: MyDatabase;
    try {
      const SQL = await init();

      let db: Database;
      if (keyIsFileName) {
        const res = await fetch("/" + key);
        const buf = await res.arrayBuffer();
        db = new SQL.Database(new Uint8Array(buf));
      } else {
        db = new SQL.Database();
      }

      myDb = { key, status: "loaded", db };
    } catch (err) {
      myDb = { key, error: err as Error, status: "error" };
    }

    useDatabaseStore.setState((state) => {
      state.databases[key] = myDb;
    });
    return myDb;
  }
);

export const useDatabase = (key: string, keyIsFileName: boolean) => {
  let db = useDatabaseStore((state) => state.databases[key]);

  if (!db) {
    db = { status: "loading", key };
    useDatabaseStore.setState((state) => {
      state.databases[key] = db as MyDatabase;
    });
    initializeDb(key, keyIsFileName).catch(console.error);
  }
  return db;
};

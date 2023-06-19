import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import initSqlJs, { Database } from "sql.js";
import { logger } from "./utils";

// Note: key may be a
// - fileName in case the DB was populated from a file or a
// - UUID if it was created blank

type MyDatabase =
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
const basePath = "/ownership";

const init = async () => {
  // sql.js needs to fetch its wasm file, so we cannot immediately instantiate the database
  // without any configuration, initSqlJs will fetch the wasm files
  const SQL = await initSqlJs({
    locateFile: () =>
      isLocal
        ? "/node_modules/sql.js/dist/sql-wasm.wasm?init"
        : basePath + "/sql-wasm.wasm?init",
  });
  return SQL;
};

const initializeFromFile = async (key: string, keyIsFileName: boolean) => {
  logger("database", "initializeFromFile", { key });

  try {
    const SQL = await init();

    let db: Database;
    if (keyIsFileName) {
      const res = await fetch(isLocal ? key : basePath + key);
      const buf = await res.arrayBuffer();
      db = new SQL.Database(new Uint8Array(buf));
    } else {
      db = new SQL.Database();
    }

    useDatabaseStore.setState((state) => {
      state.databases[key] = {
        ...state.databases[key],
        status: "loaded",
        db,
      };
    });
  } catch (err) {
    useDatabaseStore.setState((state) => {
      state.databases[key] = {
        ...state.databases[key],
        error: err as Error,
        status: "error",
      };
    });
  }
};

export const useDatabase = (key: string, keyIsFileName: boolean) => {
  let db = useDatabaseStore((state) => state.databases[key]);

  if (!db) {
    db = { status: "loading", key };
    useDatabaseStore.setState((state) => {
      state.databases[key] = db as MyDatabase;
    });
    initializeFromFile(key, keyIsFileName).catch(console.error);
  }
  return db;
};

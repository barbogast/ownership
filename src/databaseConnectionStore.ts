import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Database } from "sql.js";

export type { Database, QueryExecResult } from "sql.js";

export type DatabaseConnection =
  | {
      key: string;
      status: "uninitialized";
    }
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
  databases: { [fileName: string]: DatabaseConnection };
};

const initialState = { databases: {} };

const useDatabaseConnectionStore = create(immer<State>(() => initialState));

export default useDatabaseConnectionStore;

export const useDatabaseConnection = (key: string): DatabaseConnection => {
  const db = useDatabaseConnectionStore((state) => state.databases[key]);
  if (!db) {
    return { key, status: "uninitialized" };
  }
  return db;
};

export const deleteConnection = (key: string) => {
  useDatabaseConnectionStore.setState((state) => {
    delete state.databases[key];
  });
};

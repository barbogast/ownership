import { create } from "zustand";
import { persist, createJSONStorage, PersistOptions } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { RepositoryInfo } from "./types";
import stringify from "safe-stable-stringify";

export type DatabaseDefinition = {
  name: string;
  csvContent: string;
};

type DatabaseState = {
  databases: Record<string, DatabaseDefinition>;
};

const initialState: DatabaseState = {
  databases: {},
};

const CURRENT_VERSION = 1;

const persistConfig: PersistOptions<DatabaseState> = {
  name: "uninitializedDatabases",
  skipHydration: true,
  storage: createJSONStorage(() => localStorage),
  version: CURRENT_VERSION,
};

const useDatabaseDefinitionStore = create(
  persist(
    immer<DatabaseState>(() => initialState),
    persistConfig
  )
);

const getStorageName = (info: RepositoryInfo) => `${info.path}/databases`;

export const enable = (info: RepositoryInfo) => {
  useDatabaseDefinitionStore.persist.setOptions({ name: getStorageName(info) });
  useDatabaseDefinitionStore.persist.rehydrate();
};

export const importStore = (
  info: RepositoryInfo,
  dbs: DatabaseDefinition[]
) => {
  const content: DatabaseState = {
    databases: Object.fromEntries(dbs.map((db) => [db.name, db])),
  };
  localStorage.setItem(
    getStorageName(info),
    JSON.stringify({
      state: content,
      version: CURRENT_VERSION,
    })
  );
};

export const addDatabaseDefinition = (name: string, csvContent: string) => {
  useDatabaseDefinitionStore.setState((state) => {
    state.databases[name] = { name, csvContent };
  });
};

export default useDatabaseDefinitionStore;

type Files = Record<"content.csv" | "index.json", string>;
export const reportToFiles = (db: DatabaseDefinition) => {
  const { csvContent, ...partialDb } = db;
  const fileContents: Files = {
    "index.json": stringify(partialDb, null, 2),
    "content.csv": csvContent,
  };
  return fileContents;
};

export const filesToReport = (fileContents: Files): DatabaseDefinition => {
  return {
    ...JSON.parse(fileContents["index.json"]),
    csvContent: JSON.parse(fileContents["content.csv"]),
  };
};

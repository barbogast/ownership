import stringify from "safe-stable-stringify";
import NestedStore, { StoreConfig } from "./nestedStores";
import { FileContents } from "./util/fsHelper";
import { ColumnDefinition } from "./util/database";

export type DatabaseDefinition = {
  id: string;
  name: string;
  csvContent: string;
  tableName: string;
  columns: ColumnDefinition[];
};

export type DatabaseState = Record<string, DatabaseDefinition>;

const initialState: DatabaseState = {};

const CURRENT_VERSION = 2;

type Files = "content.csv" | "index.json";

type DatabaseDefinitionStoreConfig = StoreConfig<
  DatabaseDefinition,
  Record<string, DatabaseDefinition>,
  Files
>;

export const databaseToFiles = (
  db: DatabaseDefinition
): FileContents<Files> => {
  const { csvContent, ...partialDb } = db;
  const fileContents = {
    "index.json": stringify(partialDb, null, 2),
    "content.csv": csvContent,
  };
  return fileContents;
};

export const fileToDatabase = (
  fileContents: FileContents<Files>
): DatabaseDefinition => {
  return {
    ...JSON.parse(fileContents["index.json"]),
    csvContent: fileContents["content.csv"],
  };
};

export const databaseDefinitionStoreConfig: DatabaseDefinitionStoreConfig = {
  entityToFiles: databaseToFiles,
  filesToEntity: fileToDatabase,
  name: "databases",
  initialState,
  version: CURRENT_VERSION,
  migrate: (oldState) => {
    const state = oldState as DatabaseState;
    for (const db of Object.values(state as DatabaseState)) {
      db.columns = db.columns || [];
      db.tableName = db.tableName || "";
    }
    return state;
  },
};

export const databaseDefinitionStore = new NestedStore(
  databaseDefinitionStoreConfig
);
const useDatabaseDefinitionStore = databaseDefinitionStore.store;

export const addDatabaseDefinition = (
  id: string,
  csvContent: string,
  tableName: string,
  columns: ColumnDefinition[]
) => {
  useDatabaseDefinitionStore.setState((state) => {
    state[id] = { name: id, id, csvContent, tableName, columns };
  });
};

export const updateDatabaseDefinition = (
  id: string,
  data: Partial<DatabaseDefinition>
) => {
  useDatabaseDefinitionStore.setState((state) => {
    Object.assign(state[id], data);
  });
};

export default useDatabaseDefinitionStore;

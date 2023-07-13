import stringify from "safe-stable-stringify";
import NestedStore, { StoreConfig } from "./nestedStorage";
import { FileContents } from "./util/fsHelper";

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

type Files = "content.csv" | "index.json";

type DatabaseDefinitionStoreConfig = StoreConfig<
  "databases",
  "name",
  DatabaseDefinition,
  Files,
  { databases: Record<string, DatabaseDefinition> }
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
  idProp: "name",
  entityProp: "databases",
  initialState,
  version: CURRENT_VERSION,
};

export const databaseDefinitionStore = new NestedStore(
  databaseDefinitionStoreConfig
);
const useDatabaseDefinitionStore = databaseDefinitionStore.store;

export const addDatabaseDefinition = (name: string, csvContent: string) => {
  useDatabaseDefinitionStore.setState((state) => {
    state.databases[name] = { name, csvContent };
  });
};

export default useDatabaseDefinitionStore;

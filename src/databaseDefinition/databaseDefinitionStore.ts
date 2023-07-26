import { v4 as uuidv4 } from "uuid";
import stringify from "safe-stable-stringify";
import NestedStore, { StoreConfig } from "../nestedStores";
import { FileContents } from "../util/fsHelper";
import { ColumnDefinition } from "../util/database";
import { getNewLabel } from "../util/labels";
import { deepCopy } from "../util/utils";

export type DatabaseDefinition = {
  id: string;
  label: string;
  csvContent: string;
  tableName: string;
  columns: ColumnDefinition[];
};

export type DatabaseState = Record<string, DatabaseDefinition>;

const initialState: DatabaseState = {};

const CURRENT_VERSION = 3;

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
  migrate: (oldState, oldVersion) => {
    const state = oldState as DatabaseState;
    for (const db of Object.values(state as DatabaseState)) {
      db.columns = db.columns || [];
      db.tableName = db.tableName || "";
    }

    if (oldVersion < 3) {
      for (const db of Object.values(state as DatabaseState)) {
        // @ts-expect-error db.name was available in version 2
        db.label = db.label || db.name;
        // @ts-expect-error db.name was available in version 2
        db.id = db.name;
        // @ts-expect-error db.name was available in version 2
        delete db.name;
      }
    }
    return state;
  },
};

export const databaseDefinitionStore = new NestedStore(
  databaseDefinitionStoreConfig
);
const useDatabaseDefinitionStore = databaseDefinitionStore.store;

export const addDatabaseDefinition = (data: Omit<DatabaseDefinition, "id">) => {
  const id = uuidv4();
  useDatabaseDefinitionStore.setState((state) => {
    state[id] = {
      ...data,
      id,
    };
  });
  return id;
};

export const updateDatabaseDefinition = (
  id: string,
  data: Partial<DatabaseDefinition>
) => {
  useDatabaseDefinitionStore.setState((state) => {
    Object.assign(state[id], data);
  });
};

export const deleteDatabaseDefinition = (id: string) => {
  useDatabaseDefinitionStore.setState((state) => {
    delete state[id];
  }, true);
};

export const duplicateDatabaseDefinition = (sourceId: string) => {
  const sourceDef = useDatabaseDefinitionStore.getState()[sourceId];
  const id = uuidv4();

  const existingLabels = Object.values(
    useDatabaseDefinitionStore.getState()
  ).map((d) => d.label);

  const label = getNewLabel(existingLabels, sourceDef.label);

  useDatabaseDefinitionStore.setState((state) => {
    state[id] = {
      ...deepCopy(sourceDef),
      id,
      label,
    };
  });
  return id;
};

export default useDatabaseDefinitionStore;
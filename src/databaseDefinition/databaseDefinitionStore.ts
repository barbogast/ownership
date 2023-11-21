import NestedStore, { StoreConfig } from "../nestedStores";
import { FileContents } from "../util/fsHelper";
import { ColumnDefinition } from "../util/database";
import { getNewLabel } from "../util/labels";
import { createId, deepCopy } from "../util/utils";
import { Draft } from "immer";
import { stableStringify } from "../util/json";
import { TransformResult } from "../types";
import migrations from "./migrations";

export type JsonContent = TransformResult;

export type DatabaseDefinition = {
  id: string;
  source: "code" | "csv" | "json";
  importCode: string;
  label: string;
  csvContent: string;
  jsonContent: string;
  tableName: string;
  columns: ColumnDefinition[];
  enablePostProcessing: boolean;
  postProcessingCode: string;
};

export type DatabaseState = Record<string, DatabaseDefinition>;

const initialState: DatabaseState = {};

const CURRENT_VERSION = 8;

type Files = "content.csv" | "content.json" | "index.json" | "importCode.ts";

type DatabaseDefinitionStoreConfig = StoreConfig<
  DatabaseDefinition,
  Record<string, DatabaseDefinition>,
  Files
>;

export const databaseToFiles = (
  db: DatabaseDefinition
): FileContents<Files> => {
  const { csvContent, jsonContent, importCode, ...partialDb } = db;
  const fileContents = {
    "index.json": stableStringify(partialDb),
    "content.csv": csvContent,
    "content.json": jsonContent,
    "importCode.ts": importCode,
  };
  return fileContents;
};

export const fileToDatabase = (
  fileContents: FileContents<Files>
): DatabaseDefinition => {
  return {
    ...JSON.parse(fileContents["index.json"]),
    csvContent: fileContents["content.csv"],
    jsonContent: fileContents["content.json"],
    importCode: fileContents["importCode.ts"],
  };
};

export const databaseDefinitionStoreConfig: DatabaseDefinitionStoreConfig = {
  entityToFiles: databaseToFiles,
  filesToEntity: fileToDatabase,
  name: "databases",
  initialState,
  version: CURRENT_VERSION,
  migrations,
};

export const databaseDefinitionStore = new NestedStore(
  databaseDefinitionStoreConfig
);
const useDatabaseDefinitionStore = databaseDefinitionStore.store;

export const useDatabaseDefinition = (id: string) =>
  useDatabaseDefinitionStore((state) => state[id]);

export const addDatabaseDefinition = (data: Omit<DatabaseDefinition, "id">) => {
  const id = createId();
  useDatabaseDefinitionStore.setState((state) => {
    state[id] = {
      ...data,
      id,
    };
  });
  return id;
};

const getDbDef = (dbDefId: string) => {
  const dbDef = useDatabaseDefinitionStore.getState()[dbDefId];
  if (dbDef === undefined) {
    throw new Error(`No databaseDefinition with id "${dbDefId}" found`);
  }
  return dbDef;
};

const getDbDefFromDraft = (state: Draft<DatabaseState>, dbDefId: string) => {
  const dbDef = state[dbDefId];
  if (dbDef === undefined) {
    throw new Error(`No query with id "${dbDefId}" found`);
  }
  return dbDef;
};

export const updateDatabaseDefinition = (
  id: string,
  data: Partial<DatabaseDefinition>
) => {
  useDatabaseDefinitionStore.setState((state) => {
    const dbDef = getDbDefFromDraft(state, id);
    Object.assign(dbDef, data);
  });
};

export const deleteDatabaseDefinition = (id: string) => {
  useDatabaseDefinitionStore.setState((state) => {
    delete state[id];
  }, true);
};

export const duplicateDatabaseDefinition = (sourceId: string) => {
  const sourceDef = getDbDef(sourceId);
  const id = createId();

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

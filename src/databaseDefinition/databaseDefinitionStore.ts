import * as R from "remeda";

import NestedStore, { StoreConfig } from "../nestedStores";
import { FileContents } from "../util/fsHelper";
import { ColumnDefinition } from "../util/database";
import { getNewLabel } from "../util/labels";
import { createId, deepCopy } from "../util/utils";
import { Draft } from "immer";
import { stableStringify } from "../util/json";
import { TransformResult } from "../types";
import { migrations, CURRENT_VERSION } from "./migrations";

export type JsonContent = TransformResult;

export type Source = "code" | "csv" | "json";

export type DatabaseDefinition = {
  id: string;
  source: Source;
  importCode: string;
  label: string;
  sourceFiles: Record<string, string>;
  tableName: string;
  columns: ColumnDefinition[];
  enablePostProcessing: boolean;
  postProcessingCode: string;
};

export type DatabaseState = Record<string, DatabaseDefinition>;

const initialState: DatabaseState = {};

type Files = "index.json" | "importCode.ts" | "postProcessingCode.ts" | string;

type DatabaseDefinitionStoreConfig = StoreConfig<
  DatabaseDefinition,
  Record<string, DatabaseDefinition>,
  Files
>;

const SOURCE_FILES_FOLDER_NAME = "sourceFiles";
export const IMPORTED_FROM_CODE_FILE_NAME = "file.json";

export const databaseToFiles = (
  db: DatabaseDefinition
): FileContents<Files> => {
  const { sourceFiles, importCode, postProcessingCode, ...partialDb } = db;
  const fileContents = {
    "index.json": stableStringify(partialDb),
    "importCode.ts": importCode,
    "postProcessingCode.ts": postProcessingCode,
    ...R.mapKeys(
      sourceFiles,
      (fileName) => `${SOURCE_FILES_FOLDER_NAME}/${fileName}`
    ),
  };
  return fileContents;
};

export const fileToDatabase = (
  fileContents: FileContents<Files>
): DatabaseDefinition => {
  return {
    ...JSON.parse(fileContents["index.json"]!),
    csvContent: fileContents["content.csv"],
    jsonContent: fileContents["content.json"],
    importCode: fileContents["importCode.ts"],
    postProcessingCode: fileContents["postProcessingCode.ts"],
    ...R.pipe(
      fileContents,
      R.omitBy((_, key) => !key.startsWith(`${SOURCE_FILES_FOLDER_NAME}/`)),
      R.mapKeys((key) => key.slice(`${SOURCE_FILES_FOLDER_NAME}/`.length))
    ),
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

export const updateSourceFileContent = (
  id: string,
  fileName: string,
  content: string
) => {
  useDatabaseDefinitionStore.setState((state) => {
    const dbDef = getDbDefFromDraft(state, id);
    dbDef.sourceFiles[fileName] = content;
  });
};

export const replaceDatabaseDefinition = (
  id: string,
  data: DatabaseDefinition
) => {
  useDatabaseDefinitionStore.setState((state) => {
    state[id] = data;
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

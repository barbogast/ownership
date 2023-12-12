import * as R from "remeda";

import NestedStore, { StoreConfig } from "../nestedStores";
import { Folder, getFile, getFolder } from "../util/fsHelper";
import { ColumnDefinition } from "../util/database";
import { getNewLabel } from "../util/labels";
import { createId } from "../util/utils";
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

type DatabaseDefinitionStoreConfig = StoreConfig<
  DatabaseDefinition,
  Record<string, DatabaseDefinition>
>;

const SOURCE_FILES_FOLDER_NAME = "sourceFiles";
export const IMPORTED_FROM_CODE_FILE_NAME = "file.json";

export const exportToFolder = (state: DatabaseState): Folder => {
  const dbRoot: Folder = { files: {}, folders: {} };
  for (const db of Object.values(state)) {
    const { sourceFiles, importCode, postProcessingCode, ...partialDb } = db;
    dbRoot.folders[db.id] = {
      files: {
        "index.json": stableStringify(partialDb),
        "importCode.ts": importCode,
        "postProcessingCode.ts": postProcessingCode,
      },
      folders: {
        [SOURCE_FILES_FOLDER_NAME]: { files: sourceFiles, folders: {} },
      },
    };
  }
  return { files: {}, folders: { databases: dbRoot } };
};

export const importFromFolder = (root: Folder): DatabaseState =>
  R.mapValues(getFolder(root, "databases").folders, (folder) => {
    const db: DatabaseDefinition = {
      ...JSON.parse(getFile(folder, "index.json")),
      sourceFiles: getFolder(folder, SOURCE_FILES_FOLDER_NAME).files,
      importCode: getFile(folder, "importCode.ts", ""),
      postProcessingCode: getFile(folder, "postProcessingCode.ts", ""),
    };
    return db;
  });

export const databaseDefinitionStoreConfig: DatabaseDefinitionStoreConfig = {
  exportToFolder,
  importFromFolder,
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
      ...R.clone(sourceDef),
      id,
      label,
    };
  });
  return id;
};

export default useDatabaseDefinitionStore;

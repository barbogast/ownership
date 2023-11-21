import Papa from "papaparse";

import NestedStore, { StoreConfig } from "../nestedStores";
import { FileContents } from "../util/fsHelper";
import { ColumnDefinition } from "../util/database";
import { getNewLabel } from "../util/labels";
import { createId, deepCopy } from "../util/utils";
import { Draft } from "immer";
import { stableStringify } from "../util/json";
import { TransformResult } from "../types";

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

const migrate_2_to_3 = (state: DatabaseState) => {
  for (const db of Object.values(state as DatabaseState)) {
    // @ts-expect-error db.name was available in version 2
    db.label = db.label || db.name;
    // @ts-expect-error db.name was available in version 2
    db.id = db.name;
    // @ts-expect-error db.name was available in version 2
    delete db.name;
  }
  return state;
};

const migrate_3_to_4 = (state: DatabaseState) => {
  for (const db of Object.values(state as DatabaseState)) {
    db.source = db.source ?? "csv";
  }
  return state;
};

const migrate_4_to_5 = (state: DatabaseState) => {
  for (const db of Object.values(state as DatabaseState)) {
    db.columns.forEach((col) => {
      // @ts-expect-error db.csvName was available in version 4
      col.sourceName = col.sourceName ?? col.csvName;
      // @ts-expect-error db.csvName was available in version 4
      delete col.csvName;
    });
  }
  return state;
};

const migrate_5_to_6 = (state: DatabaseState) => {
  for (const db of Object.values(state as DatabaseState)) {
    db.enablePostProcessing = db.enablePostProcessing ?? false;
    db.postProcessingCode = db.postProcessingCode ?? "";
  }
  return state;
};

const migrate_6_to_7 = (state: DatabaseState) => {
  for (const db of Object.values(state as DatabaseState)) {
    if (db.source === "code") {
      db.jsonContent = stableStringify(
        Papa.parse(db.csvContent, { header: true }).data
      );
      db.csvContent = "";
    }

    if (db.source === "json") {
      db.csvContent = "";
    }
  }
  return state;
};

const migrate_7_to_8 = (state: DatabaseState) => {
  for (const db of Object.values(state as DatabaseState)) {
    // @ts-expect-error db.importCode was available in version 8
    db.importCode = db.code;
    // @ts-expect-error db.code was removed in version 8
    delete db.code;
  }
  return state;
};

const migrations: Record<string, (state: DatabaseState) => DatabaseState> = {
  3: migrate_2_to_3,
  4: migrate_3_to_4,
  5: migrate_4_to_5,
  6: migrate_5_to_6,
  7: migrate_6_to_7,
  8: migrate_7_to_8,
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

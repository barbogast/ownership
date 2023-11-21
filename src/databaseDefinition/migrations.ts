import Papa from "papaparse";

import { stableStringify } from "../util/json";
import { DatabaseState } from "./databaseDefinitionStore";

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
    // @ts-expect-error db.code was renamed in version 8
    db.code = "";
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

export const migrations: Record<
  string,
  (state: DatabaseState) => DatabaseState
> = {
  2: migrate_2_to_3,
  3: migrate_3_to_4,
  4: migrate_4_to_5,
  5: migrate_5_to_6,
  6: migrate_6_to_7,
  7: migrate_7_to_8,
};

export const CURRENT_VERSION = 8;

import { expect, test } from "vitest";
import {
  DatabaseDefinition,
  DatabaseState,
  exportToFolder,
  importFromFolder,
} from "./databaseDefinitionStore";
import { stableStringify } from "../util/json";
import { flattenFolder, omitEmpty } from "../util/fsHelper";

type TestCase = {
  state: DatabaseState;

  // Notes that the expected output is specified in flattened form for easier readability
  expected: Record<string, string>;

  name: string;
};

const getCase_csv = (): TestCase => {
  const db: DatabaseDefinition = {
    id: "the-id",
    source: "csv",
    importCode: "",
    label: "the label",
    sourceFiles: {
      "file1.csv": "col1,col1\n1,2",
      "file2.csv": "col1,col1\n3,4",
    },
    tableName: "t1",
    columns: [
      { sourceName: "col1", dbName: "col1", type: "integer" },
      { sourceName: "col2", dbName: "col2", type: "integer" },
    ],
    enablePostProcessing: false,
    postProcessingCode: "",
  };

  const expectedIndex = stableStringify({
    id: "the-id",
    source: "csv",
    label: "the label",
    tableName: "t1",
    columns: [
      { sourceName: "col1", dbName: "col1", type: "integer" },
      { sourceName: "col2", dbName: "col2", type: "integer" },
    ],
    enablePostProcessing: false,
  });

  const expected = {
    "databases/the-id/index.json": expectedIndex,
    "databases/the-id/sourceFiles/file1.csv": "col1,col1\n1,2",
    "databases/the-id/sourceFiles/file2.csv": "col1,col1\n3,4",
  };

  return { state: { [db.id]: db }, expected, name: "csv" };
};

const getCase_withPostProcessing = (): TestCase => {
  const db: DatabaseDefinition = {
    id: "the-id",
    source: "csv",
    importCode: "",
    label: "the label",
    sourceFiles: {
      "file1.csv": "col1,col1\n1,2",
      "file2.csv": "col1,col1\n3,4",
    },
    tableName: "t1",
    columns: [
      { sourceName: "col1", dbName: "col1", type: "integer" },
      { sourceName: "col2", dbName: "col2", type: "integer" },
    ],
    enablePostProcessing: true,
    postProcessingCode: "this is the postProcessing code",
  };

  const expectedIndex = stableStringify({
    id: "the-id",
    source: "csv",
    label: "the label",
    tableName: "t1",
    columns: [
      { sourceName: "col1", dbName: "col1", type: "integer" },
      { sourceName: "col2", dbName: "col2", type: "integer" },
    ],
    enablePostProcessing: true,
  });

  const expected = {
    "databases/the-id/index.json": expectedIndex,
    "databases/the-id/postProcessingCode.ts": "this is the postProcessing code",
    "databases/the-id/sourceFiles/file1.csv": "col1,col1\n1,2",
    "databases/the-id/sourceFiles/file2.csv": "col1,col1\n3,4",
  };

  return { state: { [db.id]: db }, expected, name: "csv with post Process" };
};

const getCase_importCode = (): TestCase => {
  const db: DatabaseDefinition = {
    id: "the-id",
    source: "code",
    importCode: "this is the import code",
    label: "the label",
    sourceFiles: {},
    tableName: "t1",
    columns: [
      { sourceName: "col1", dbName: "col1", type: "integer" },
      { sourceName: "col2", dbName: "col2", type: "integer" },
    ],
    enablePostProcessing: false,
    postProcessingCode: "",
  };

  const expectedIndex = stableStringify({
    id: "the-id",
    source: "code",
    label: "the label",
    tableName: "t1",
    columns: [
      { sourceName: "col1", dbName: "col1", type: "integer" },
      { sourceName: "col2", dbName: "col2", type: "integer" },
    ],
    enablePostProcessing: false,
  });

  const expected = {
    "databases/the-id/index.json": expectedIndex,
    "databases/the-id/importCode.ts": "this is the import code",
  };

  return { state: { [db.id]: db }, expected, name: "import code" };
};

const cases: TestCase[] = [
  getCase_csv(),
  getCase_withPostProcessing(),
  getCase_importCode(),
];

test.each(cases)("Persist: $name", ({ state, expected }) => {
  const exported = exportToFolder(state);

  // Flatten result for easier readability
  // Empty files are removed to match the behaviour when saving to git
  const flattend = flattenFolder(omitEmpty(exported));
  expect(flattend).toEqual(expected);

  // Re-import and compare with original state
  expect(importFromFolder(exported)).toEqual(state);
});

import { expect, test } from "vitest";
import {
  Query,
  QueryState,
  exportToFolder,
  importFromFolder,
} from "./queryStore";
import { stableStringify } from "../util/json";
import { flattenFolder, omitEmpty } from "../util/fsHelper";

type TestCase = {
  state: QueryState;

  // Notes that the expected output is specified in flattened form for easier readability
  expected: Record<string, string>;

  name: string;
};

const getCase_minimal = (): TestCase => {
  const query: Query = {
    id: "my-query",
    label: "My query",
    databaseFileName: "obsolete - remove this prop",
    databaseSource: { type: "local", id: "my-db" },
    sqlStatement: "",
    transformCode: "",
    transformType: "config",
    transformConfig: {
      dataOrientation: "row",
      selectedColumns: ["col1", "col2"],
      labelColumn: "col1",
      dataRowIndex: 0,
    },
    chartConfig: { chartType: "lineChart" },
  };

  const expectedIndex = stableStringify({
    id: "my-query",
    chartConfig: { chartType: "lineChart" },
    label: "My query",
    databaseFileName: "obsolete - remove this prop",
    databaseSource: { type: "local", id: "my-db" },
    transformType: "config",
    transformConfig: {
      dataOrientation: "row",
      selectedColumns: ["col1", "col2"],
      labelColumn: "col1",
      dataRowIndex: 0,
    },
  });

  const expected = {
    "queries/my-query/index.json": expectedIndex,
  };

  return { state: { [query.id]: query }, expected, name: "minimal" };
};

const getCase_withExtraFilesAndChartConfig = (): TestCase => {
  const query: Query = {
    id: "my-query",
    label: "My query",
    databaseFileName: "obsolete - remove this prop",
    databaseSource: { type: "local", id: "my-db" },
    sqlStatement: "select * from t1",
    transformCode: "this is some code",
    transformType: "config",
    transformConfig: {
      dataOrientation: "row",
      selectedColumns: ["col1", "col2"],
      labelColumn: "col1",
      dataRowIndex: 0,
    },
    chartConfig: { chartType: "barChart" },
  };

  const expectedIndex = stableStringify({
    id: "my-query",
    label: "My query",
    databaseFileName: "obsolete - remove this prop",
    databaseSource: { type: "local", id: "my-db" },
    transformType: "config",
    transformConfig: {
      dataOrientation: "row",
      selectedColumns: ["col1", "col2"],
      labelColumn: "col1",
      dataRowIndex: 0,
    },
    chartConfig: { chartType: "barChart" },
  });

  const expected = {
    "queries/my-query/index.json": expectedIndex,
    "queries/my-query/sqlStatement.sql": "select * from t1",
    "queries/my-query/transformCode.ts": "this is some code",
  };

  return {
    state: { [query.id]: query },
    expected,
    name: "with extra files and chartConfig",
  };
};

const getCase_withVega = (): TestCase => {
  const query: Query = {
    id: "my-query",
    label: "My query",
    databaseFileName: "obsolete - remove this prop",
    databaseSource: { type: "local", id: "my-db" },
    sqlStatement: "",
    transformCode: "",
    transformType: "config",
    transformConfig: {
      dataOrientation: "row",
      selectedColumns: ["col1", "col2"],
      labelColumn: "col1",
      dataRowIndex: 0,
    },
    chartConfig: {
      chartType: "vegaChart",
      vegaSpec: "This is some vega spec",
    },
  };

  const expectedIndex = stableStringify({
    id: "my-query",
    label: "My query",
    databaseFileName: "obsolete - remove this prop",
    databaseSource: { type: "local", id: "my-db" },
    transformType: "config",
    transformConfig: {
      dataOrientation: "row",
      selectedColumns: ["col1", "col2"],
      labelColumn: "col1",
      dataRowIndex: 0,
    },
    chartConfig: {
      chartType: "vegaChart",
    },
  });

  const expected = {
    "queries/my-query/index.json": expectedIndex,
    "queries/my-query/vegaSpec.json": "This is some vega spec",
  };

  return { state: { [query.id]: query }, expected, name: "with extra files" };
};

const cases: TestCase[] = [
  getCase_minimal(),
  getCase_withExtraFilesAndChartConfig(),
  getCase_withVega(),
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

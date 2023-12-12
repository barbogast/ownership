import { expect, test } from "vitest";
import {
  Report,
  ReportState,
  exportToFolder,
  importFromFolder,
} from "./reportStore";
import { stableStringify } from "../util/json";
import { flattenFolder, omitEmpty } from "../util/fsHelper";

type TestCase = {
  state: ReportState;

  // Notes that the expected output is specified in flattened form for easier readability
  expected: Record<string, string>;

  name: string;
};

const getCase_minimal = (): TestCase => {
  const report: Report = {
    id: "my-report",
    label: "My report",
    blocks: [["this is a block"]],
  };

  const expectedIndex = stableStringify({
    id: "my-report",
    label: "My report",
  });

  const expected = {
    "reports/my-report/index.json": expectedIndex,
    "reports/my-report/blocks.json": stableStringify([["this is a block"]]),
  };

  return { state: { [report.id]: report }, expected, name: "minimal" };
};

const cases: TestCase[] = [getCase_minimal()];

test.each(cases)("Persist: $name", ({ state, expected }) => {
  const exported = exportToFolder(state);

  // Flatten result for easier readability
  // Empty files are removed to match the behaviour when saving to git
  const flattend = flattenFolder(omitEmpty(exported));
  expect(flattend).toEqual(expected);

  // Re-import and compare with original state
  expect(importFromFolder(exported)).toEqual(state);
});

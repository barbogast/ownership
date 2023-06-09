import { describe, expect, test } from "vitest";
import {
  columnsToObjects,
  rowsToObjects,
  singleRowColumnsToObjects,
} from "./transform";

describe("transform", () => {
  const source = {
    columns: ["col_a", "col_b", "col_c", "col_d"],
    values: [
      ["A1", "B1", "C1", "D1"],
      ["A2", "B2", "C2", "D2"],
      ["A3", "B3", "C3", "D3"],
    ],
  };

  test("rowsToObjects", () => {
    const expected = [
      { col_a: "A1", col_b: "B1", col_c: "C1", col_d: "D1" },
      { col_a: "A2", col_b: "B2", col_c: "C2", col_d: "D2" },
      { col_a: "A3", col_b: "B3", col_c: "C3", col_d: "D3" },
    ];

    expect(rowsToObjects(source)).toEqual(expected);
  });

  test("columnsToObjects", () => {
    const expected = [
      { label: "col_b", A1: "B1", A2: "B2", A3: "B3" },
      { label: "col_c", A1: "C1", A2: "C2", A3: "C3" },
      { label: "col_d", A1: "D1", A2: "D2", A3: "D3" },
    ];
    expect(columnsToObjects(source, "col_a")).toEqual(expected);
  });

  test("singleRowColumnsToObjects", () => {
    const expected = [
      { label: "col_a", value: "A1" },
      { label: "col_b", value: "B1" },
      { label: "col_c", value: "C1" },
      { label: "col_d", value: "D1" },
    ];
    expect(singleRowColumnsToObjects(source)).toEqual(expected);
  });
});

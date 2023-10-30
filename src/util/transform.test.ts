import { describe, expect, test } from "vitest";
import {
  flipArrayOfObjects,
  objectToArray,
  objectsToRows,
  rowsToObjects,
} from "./transform";

describe("transform", () => {
  test("rowsToObjects", () => {
    const source = {
      columns: ["col_a", "col_b", "col_c", "col_d"],
      values: [
        ["A1", "B1", "C1", "D1"],
        ["A2", "B2", "C2", "D2"],
        ["A3", "B3", "C3", "D3"],
      ],
    };

    const expected = [
      { col_a: "A1", col_b: "B1", col_c: "C1", col_d: "D1" },
      { col_a: "A2", col_b: "B2", col_c: "C2", col_d: "D2" },
      { col_a: "A3", col_b: "B3", col_c: "C3", col_d: "D3" },
    ];

    expect(rowsToObjects(source)).toEqual(expected);
  });

  test("objectsToRows", () => {
    const source = [
      { col_a: "A1", col_b: "B1", col_c: "C1", col_d: "D1" },
      { col_a: "A2", col_b: "B2", col_c: "C2", col_d: "D2" },
      { col_a: "A3", col_b: "B3", col_c: "C3", col_d: "D3" },
    ];
    const columns = ["col_a", "col_b", "col_c", "col_d"];

    const expected = [
      ["A1", "B1", "C1", "D1"],
      ["A2", "B2", "C2", "D2"],
      ["A3", "B3", "C3", "D3"],
    ];

    expect(objectsToRows(source, columns)).toEqual(expected);
  });

  test("flipArrayOfObjects", () => {
    const source = [
      { col_a: "A1", col_b: "B1", col_c: "C1", col_d: "D1" },
      { col_a: "A2", col_b: "B2", col_c: "C2", col_d: "D2" },
      { col_a: "A3", col_b: "B3", col_c: "C3", col_d: "D3" },
    ];

    const expected = [
      { label: "col_b", A1: "B1", A2: "B2", A3: "B3" },
      { label: "col_c", A1: "C1", A2: "C2", A3: "C3" },
      { label: "col_d", A1: "D1", A2: "D2", A3: "D3" },
    ];
    expect(flipArrayOfObjects(source, "col_a")).toEqual(expected);
  });

  test("objectToArray", () => {
    // Result of rowsToObjects() or columnsToObjects()
    const transformedAsRows = [
      { col_a: "A1", col_b: "B1", col_c: "C1", col_d: "D1" },
      { col_a: "A2", col_b: "B2", col_c: "C2", col_d: "D2" },
      { col_a: "A3", col_b: "B3", col_c: "C3", col_d: "D3" },
    ];

    const expected1 = [
      { label: "col_a", value: "A1" },
      { label: "col_b", value: "B1" },
      { label: "col_c", value: "C1" },
      { label: "col_d", value: "D1" },
    ];

    const expected2 = [
      { label: "col_a", value: "A3" },
      { label: "col_b", value: "B3" },
      { label: "col_c", value: "C3" },
      { label: "col_d", value: "D3" },
    ];

    expect(objectToArray(transformedAsRows, 0)).toEqual(expected1);
    expect(objectToArray(transformedAsRows, 2)).toEqual(expected2);
  });
});

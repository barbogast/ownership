import slugify from "slugify";

import { ColumnDefinition } from "./database";

export type CsvRecords = string[][];

const guessType = (rows: CsvRecords, headerIndex: number) => {
  const firstDataRow = rows[1];
  if (!firstDataRow) {
    return "text";
  }
  const value = firstDataRow[headerIndex];
  if (value === undefined) {
    return "text";
  }

  if (String(parseInt(value)) === value) {
    return "integer";
  }

  if (
    String(parseFloat(value)) ===
    // parseFloat(111.0) will result in "111"
    value.replace(".0", "")
  ) {
    return "real";
  }

  return "text";
};

export const analyzeCsvHeader = (records: CsvRecords): ColumnDefinition[] => {
  const firstRow = records[0];
  if (!firstRow) {
    return [];
  }
  const columns = firstRow.map(
    (name, index) =>
      ({
        sourceName: name,
        dbName: slugify(name, "_").toLowerCase().replace("-", "_"),
        type: guessType(records, index),
      } as const)
  );
  return columns;
};

import slugify from "slugify";

import { ColumnDefinition } from "./database";

export type CsvRecords = string[][];

const guessType = (rows: CsvRecords, headerIndex: number) => {
  const value = rows[1][headerIndex];
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
  const columns = records[0].map(
    (name, index) =>
      ({
        csvName: name,
        dbName: slugify(name, "_").toLowerCase().replace("-", "_"),
        type: guessType(records, index),
      } as const)
  );
  return columns;
};

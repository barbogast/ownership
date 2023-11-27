import slugify from "slugify";
import * as R from "remeda";

import { ColumnDefinition } from "./database";
import Papa from "papaparse";
import { TransformResult, Value } from "../types";

export type CsvRow = string[];
export type CsvRecords = CsvRow[];
export type CsvFile = { header: CsvRow; data: CsvRecords };

const guessType = (rows: CsvRecords, headerIndex: number) => {
  const firstDataRow = rows[0];
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

export const analyzeHeader = (csvFile: CsvFile): ColumnDefinition[] => {
  const columns = csvFile.header.map(
    (name, index) =>
      ({
        sourceName: name,
        dbName: slugify(name, "_").replace("-", "_"),
        type: guessType(csvFile.data, index),
      } as const)
  );
  return columns;
};

export const arraysToObjects = (csvFile: CsvFile): TransformResult =>
  csvFile.data.map((row) =>
    Object.fromEntries(
      csvFile.header.map((header, index) => [header, row[index]]) as [
        string,
        Value
      ][]
    )
  );

export const parseSourceFiles = (
  sourceFiles: Record<string, string>
): Record<string, CsvFile> => {
  const files = R.pipe(
    sourceFiles,
    R.mapValues((fileContent) => Papa.parse<string[]>(fileContent)),
    R.mapValues(({ data }) => ({
      header: data[0]!,
      data: data.slice(1),
    }))
  );

  return files;
};

export const mergeFiles = (files: Record<string, CsvFile>): CsvFile => {
  const header = Object.values(files)[0]!.header;
  const data = Object.values(files).flatMap((c) => c.data);
  return { header, data };
};

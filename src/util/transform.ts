import { QueryExecResult } from "sql.js";
import { TransformResult } from "../types";
import Logger from "./logger";

const logger = new Logger("transform");

export const rowsToObjects = logger.wrap(
  "rowsToObjects",
  (queryResults: QueryExecResult) => {
    return queryResults.values.map((row) =>
      Object.fromEntries(row.map((v, i) => [queryResults.columns[i], v]))
    );
  }
);

export const objectsToRows = logger.wrap(
  "objectsToRows",
  (
    transformResult: TransformResult,
    columns: string[]
  ): (string | number | null)[][] => {
    return transformResult.map((row) =>
      columns.map((col) => (row[col] as string | number | null) ?? null)
    );
  }
);

export const flipArrayOfObjects = logger.wrap(
  "flipArrayOfObjects",
  (queryResult: TransformResult, labelColumn: string) =>
    Object.keys(queryResult[0]!)
      .filter((col) => col !== labelColumn)
      .map((key) =>
        Object.fromEntries(
          ([["label", key]] as [string, unknown][]).concat(
            queryResult.map((row) => [row[labelColumn] as string, row[key]])
          )
        )
      )
);

export const extractSingleDataset = logger.wrap(
  "extractSingleDataset",
  (
    transformResult: TransformResult,
    dataRowIndex: number,
    labelColumn: string
  ) => {
    const row = transformResult[dataRowIndex];
    if (!row) {
      return [];
    }
    return Object.entries(row)
      .filter(([key]) => key !== labelColumn)
      .map(([key, value]) => ({
        label: key,
        value,
      }));
  }
);

export const objectToArray = logger.wrap(
  "objectToArray",
  (transformResult: TransformResult, index: number): TransformResult => {
    const row = transformResult[index];
    if (!row) {
      return [];
    }
    return Object.entries(row).map(([label, value]) => ({
      label,
      value,
    }));
  }
);

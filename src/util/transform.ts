import { QueryExecResult, SqlValue } from "sql.js";
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

export const columnsToObjects = logger.wrap(
  "columnsToObjects",
  (queryResults: QueryExecResult, labelColumn: string) => {
    return queryResults.columns
      .map((col, i) => [col, i] as [string, number])
      .filter(([col]) => col !== labelColumn)
      .map(([col, i]) =>
        Object.fromEntries(
          [["label", col] as [SqlValue, SqlValue]].concat(
            queryResults.values.map((row) => [
              row[queryResults.columns.indexOf(labelColumn)]!,
              row[i]!,
            ])
          )
        )
      );
  }
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

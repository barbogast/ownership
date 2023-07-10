import { QueryExecResult, SqlValue } from "sql.js";
import { TransformResult } from "../types";

export const rowsToObjects = (queryResults: QueryExecResult) => {
  console.log("rowsToObjects", queryResults);
  return queryResults.values.map((row) =>
    Object.fromEntries(row.map((v, i) => [queryResults.columns[i], v]))
  );
};

export const columnsToObjects = (
  queryResults: QueryExecResult,
  labelColumn: string
) => {
  console.log("columnsToObjects", queryResults);
  return queryResults.columns
    .map((col, i) => [col, i] as [string, number])
    .filter(([col]) => col !== labelColumn)
    .map(([col, i]) =>
      Object.fromEntries(
        [["label", col] as [SqlValue, SqlValue]].concat(
          queryResults.values.map((row) => [
            row[queryResults.columns.indexOf(labelColumn)],
            row[i],
          ])
        )
      )
    );
};

export const singleRowColumnsToObjects = (queryResults: QueryExecResult) => {
  console.log("singleRowColumnsToObjects", queryResults);
  return queryResults.columns.map((col, i) => ({
    label: col,
    value: queryResults.values[0][i],
  }));
};

export const extractSingleDataset = (
  transformResult: TransformResult,
  dataRowIndex: number,
  labelColumn: string
) => {
  if (dataRowIndex >= transformResult.length) {
    return [];
  }
  return Object.entries(transformResult[dataRowIndex])
    .filter(([key]) => key !== labelColumn)
    .map(([key, value]) => ({
      name: key,
      value,
    }));
};

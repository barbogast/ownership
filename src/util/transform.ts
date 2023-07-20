import { QueryExecResult, SqlValue } from "sql.js";
import { TransformResult } from "../types";
import Logger from "./logger";
import { Query, TransformConfig } from "../query/queryStore";
import { SINGLE_DATASET_CHART_TYPES } from "../display/Index";

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
              row[queryResults.columns.indexOf(labelColumn)],
              row[i],
            ])
          )
        )
      );
  }
);

export const singleRowColumnsToObjects = logger.wrap(
  "singleRowColumnsToObjects",
  (queryResults: QueryExecResult) => {
    return queryResults.columns.map((col, i) => ({
      label: col,
      value: queryResults.values[0][i],
    }));
  }
);

export const extractSingleDataset = logger.wrap(
  "extractSingleDataset",
  (
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
        label: key,
        value,
      }));
  }
);

export const applyTransformConfig = (
  transformConfig: TransformConfig,
  queryResults: QueryExecResult[]
): TransformResult => {
  if (!queryResults.length) {
    return [];
  }
  const { dataOrientation, labelColumn } = transformConfig;

  let data;
  if (dataOrientation === "column") {
    data = rowsToObjects(queryResults[0]);
  } else {
    if (labelColumn === "--no-label-column--") {
      data = singleRowColumnsToObjects(queryResults[0]);
    } else {
      data = columnsToObjects(queryResults[0], labelColumn);
    }
  }

  return data;
};

export const transform2 = (transformResult: TransformResult, query: Query) => {
  const { chartType, transformConfig } = query;
  const { labelColumn, dataRowIndex, dataOrientation } = transformConfig;

  const transformResult2 =
    SINGLE_DATASET_CHART_TYPES.includes(chartType!) &&
    dataRowIndex !== undefined
      ? extractSingleDataset(
          transformResult,
          dataRowIndex,
          dataOrientation === "row" ? "label" : labelColumn
        )
      : transformResult;

  return transformResult;
};

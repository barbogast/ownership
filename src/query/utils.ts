import { QueryExecResult } from "../Db";

export const queryExecResultToObjects = (queryResult: QueryExecResult) =>
  queryResult.values.map((row, i) => ({
    ...Object.fromEntries(queryResult.columns.map((k, i) => [k, row[i]])),
    key: i,
  }));
import stringify from "safe-stable-stringify";
import * as R from "remeda";

import { ColumnDefinition } from "./database";
import { TransformResult } from "../types";

export const parseJson = <Shape>(source: string) => JSON.parse(source) as Shape;

export const stableStringify = (data: unknown): string =>
  stringify(data, null, 2) as string;

export const analyzeJsonHeader = (
  data: TransformResult
): ColumnDefinition[] => {
  const jsonTypeToDbType = (value: unknown) => {
    switch (typeof value) {
      case "string":
        return "text";
      case "number":
        return value % 1 === 0 ? "integer" : "real";
      case "boolean":
        return "text";
      default:
        return "text";
    }
  };

  if (!Array.isArray(data)) {
    return [];
  }

  return Object.entries(data[0]!).map(([key, value]) => ({
    sourceName: key,
    dbName: key,
    type: jsonTypeToDbType(value),
  }));
};

export const parseSourceFiles = (
  sourceFiles: Record<string, string>
): Record<string, unknown> => R.mapValues(sourceFiles, parseJson);

export const mergeFiles = <T>(files: Record<string, unknown>): T[] =>
  Object.values(files).flatMap((fileContent) => fileContent as T);

import stringify from "safe-stable-stringify";

import { ColumnDefinition } from "./database";

export const parseJson = (source: string) => JSON.parse(source);

export const stableStringify = (data: unknown): string =>
  stringify(data, null, 2) as string;

export const analyseJsonHeader = (data: unknown): ColumnDefinition[] => {
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

  return Object.entries(data[0]).map(([key, value]) => ({
    sourceName: key,
    dbName: key,
    type: jsonTypeToDbType(value),
  }));
};

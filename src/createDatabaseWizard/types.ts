import { ColumnDefinition } from "../util/database";

export type StepName =
  | "stepSource"
  | "code"
  | "parseCsv"
  | "parseJson"
  | "configureColumns"
  | "configureDatabase";

export type Source = "code" | "csv" | "json";

export type StepResult = {
  source: "code" | "csv" | "json";
  code: string;
  csvContent: string;
  jsonContent: string;
  parsedContent: (string | number | null)[][];
  columns: ColumnDefinition[];
  tableName: string;
  label: string;
  id: string;
};

import { ColumnDefinition } from "../util/database";

export type StepName =
  | "stepSource"
  | "code"
  | "parseCsv"
  | "configureColumns"
  | "configureDatabase";

export type StepResult = {
  source: "code" | "csv";
  code: string;
  csvContent: string;
  parsedCsvContent: (string | number | null)[][];
  columns: ColumnDefinition[];
  tableName: string;
  label: string;
  id: string;
};

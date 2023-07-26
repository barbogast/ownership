import { ColumnDefinition } from "../util/database";

export type StepResult = {
  csvContent: string;
  parsedCsvContent: string[][];
  columns: ColumnDefinition[];
  tableName: string;
  label: string;
  id: string;
};

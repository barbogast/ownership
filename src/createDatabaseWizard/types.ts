import { ColumnDefinition } from "../util/database";

export type StepResult = {
  csvContent: string;
  columns: ColumnDefinition[];
  tableName: string;
  name: string;
};

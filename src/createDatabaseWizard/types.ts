import { DatabaseDefinition } from "../databaseDefinition/databaseDefinitionStore";

export type StepName =
  | "source"
  | "importFromCode"
  | "importFromCsv"
  | "importFromJson"
  | "postProcessing"
  | "configureColumns"
  | "configureDatabase";

export type Source = "code" | "csv" | "json";

export type StepResult = DatabaseDefinition & {
  parsedCsvContent?: string[][];
  parsedJsonContent?: unknown;
};

import { Source } from "../databaseDefinition/databaseDefinitionStore";
import { StepName } from "./types";

export const sourceToStepMapping: Record<Source, StepName> = {
  csv: "importFromFile",
  json: "importFromFile",
  code: "importFromCode",
};

import { Source, StepName } from "./types";

export const sourceToStepMapping: Record<Source, StepName> = {
  csv: "importFromCsv",
  json: "importFromJson",
  code: "importFromCode",
};

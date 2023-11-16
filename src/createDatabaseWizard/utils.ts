import { Source, StepName } from "./types";

export const sourceToStepMapping: Record<Source, StepName> = {
  csv: "parseCsv",
  json: "parseJson",
  code: "code",
};

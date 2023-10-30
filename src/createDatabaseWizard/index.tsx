import step1ParseCsv from "./step1ParseCsv";
import step3ConfigureDatabase from "./step3ConfigureDatabase";
import step2ConfigureColumns from "./step2ConfigureColumns";
import stepSource from "./stepSource";
import stepCode from "./stepCode";
import { WizardConfig } from "../components/wizard/types";
import { StepName, StepResult } from "./types";

const getConfig = (
  isExistingDb: boolean
): WizardConfig<StepName, StepResult> => ({
  steps: {
    stepSource: stepSource(),
    code: stepCode(),
    parseCsv: step1ParseCsv(),
    configureColumns: step2ConfigureColumns(),
    configureDatabase: step3ConfigureDatabase(isExistingDb),
  },
});

export default getConfig;

import stepParseCsv from "./stepParseCsv";
import stepParseJson from "./stepParseJson";
import stepConfigureDatabase from "./stepConfigureDatabase";
import stepConfigureColumns from "./stepConfigureColumns";
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
    parseCsv: stepParseCsv(),
    parseJson: stepParseJson(),
    configureColumns: stepConfigureColumns(),
    configureDatabase: stepConfigureDatabase(isExistingDb),
  },
});

export default getConfig;

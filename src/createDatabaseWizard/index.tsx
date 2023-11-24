import stepImportFromFile from "./stepImportFromFile";
import stepPostProcessing from "./stepPostProcessing";
import stepConfigureDatabase from "./stepConfigureDatabase";
import stepConfigureColumns from "./stepConfigureColumns";
import stepSource from "./stepSource";
import stepImportFromCode from "./stepImportFromCode";
import { WizardConfig } from "../components/wizard/types";
import { StepName, StepResult } from "./types";

const getConfig = (
  isExistingDb: boolean
): WizardConfig<StepName, StepResult> => ({
  steps: {
    source: stepSource(),
    importFromCode: stepImportFromCode(),
    importFromFile: stepImportFromFile(),
    postProcessing: stepPostProcessing(),
    configureColumns: stepConfigureColumns(),
    configureDatabase: stepConfigureDatabase(isExistingDb),
  },
});

export default getConfig;

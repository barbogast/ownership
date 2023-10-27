import step1ParseCsv from "./step1ParseCsv";
import step3ConfigureDatabase from "./step3ConfigureDatabase";
import step2ConfigureColumns from "./step2ConfigureColumns";
import { WizardConfig } from "../components/wizard/types";
import { StepName, StepResult } from "./types";

const getConfig = (
  isExistingDb: boolean
): WizardConfig<StepName, StepResult> => ({
  steps: {
    parseCsv: step1ParseCsv(),
    configureColumns: step2ConfigureColumns(),
    configureDatabase: step3ConfigureDatabase(isExistingDb),
  },
  initialResult: {
    id: "",
    label: "",
    tableName: "",
    csvContent: "",
    columns: [],
    parsedCsvContent: [],
  },
  initialStepName: "parseCsv",
});

export default getConfig;

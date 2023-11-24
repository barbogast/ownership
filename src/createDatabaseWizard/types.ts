import * as postProcessJson from "../codeExecution/postProcessJson";
import * as postProcessCsv from "../codeExecution/postProcessCsv";
import { DatabaseDefinition } from "../databaseDefinition/databaseDefinitionStore";

export type StepName =
  | "source"
  | "importFromCode"
  | "importFromJson"
  | "postProcessing"
  | "configureColumns"
  | "configureDatabase";

export type StepResult = DatabaseDefinition & {
  // These fields are used to store the various results of parsing the input files
  json: {
    beforePostProcessing?: postProcessJson.Input;
    finalContent?: postProcessJson.ReturnValue;
  };

  csv: {
    beforePostProcessing?: postProcessCsv.Input;
    finalContent?: postProcessCsv.ReturnValue;
  };
};

import step1ParseCsv from "./step1ParseCsv";
import step3ConfigureDatabase from "./step3ConfigureDatabase";
import step2ConfigureColumns from "./step2ConfigureColumns";

const getSteps = (isExistingDb: boolean) => [
  step1ParseCsv(),
  step2ConfigureColumns(),
  step3ConfigureDatabase(isExistingDb),
];

export default getSteps;

import { WizardConfig } from "../components/wizard/types";
import { Result, StepName } from "./types";
import getStepOverview from "./step0Overview";
import getStepImport from "./step1Import";
import getStepQuery from "./step2Query";
import getStepTransform from "./step3Transform";
import getStepChart from "./step4Chart";
import getStepGit from "./step5Git";
import getStepShare from "./step6aShare";
import getStepCollaborate from "./step7Collaborate";

const getConfig = (): WizardConfig<StepName, Result> => ({
  steps: {
    stepOverview: getStepOverview(),
    stepImport: getStepImport(),
    stepQuery: getStepQuery(),
    stepTransform: getStepTransform(),
    stepChart: getStepChart(),
    stepGit: getStepGit(),
    stepShare: getStepShare(),
    stepCollaborate: getStepCollaborate(),
  },
});

export default getConfig;

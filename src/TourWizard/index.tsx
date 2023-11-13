import { WizardConfig } from "../components/wizard/types";
import { Result, StepName } from "./types";
import getStepOverview from "./step0Overview";
import getStepCsv from "./step1aCsv";
import getStepCode from "./step1bCode";
import getStepSql from "./step2aSql";
import getStepPivot from "./step2bPivot";
import getStepTransform from "./step3Transform";
import getStepChart from "./step4Chart";
import getStepGit from "./step5Git";
import getStepShare from "./step6aShare";
import getStepWebsite from "./step6bWebsite";
import getStepExplore from "./step7Explore";

const getConfig = (): WizardConfig<StepName, Result> => ({
  steps: {
    stepOverview: getStepOverview(),
    stepCsv: getStepCsv(),
    stepCode: getStepCode(),
    stepSql: getStepSql(),
    stepPivot: getStepPivot(),
    stepTransform: getStepTransform(),
    stepChart: getStepChart(),
    stepGit: getStepGit(),
    stepShare: getStepShare(),
    stepWebsite: getStepWebsite(),
    stepExplore: getStepExplore(),
  },
});

export default getConfig;

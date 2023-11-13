import { Step } from "../components/wizard/types";
import { StepName, Result } from "./types";

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "... or embedd in website",
    nextStep: "stepExplore",
    component: () => (
      <div>Embedd a chart on your own website (not yet available)</div>
    ),
  };

  return step;
};

export default getStep;

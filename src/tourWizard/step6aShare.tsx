import { Step } from "../components/wizard/types";
import { StepName, Result } from "./types";

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "6. Share",
    nextStep: "stepCollaborate",
    component: () => (
      <>
        <div>Share your work with a simple link (not yet available)</div>
        <div>Embedd a chart on your own website (not yet available)</div>
      </>
    ),
  };

  return step;
};

export default getStep;

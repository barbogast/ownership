import { Step } from "../components/wizard/types";
import { StepName, Result } from "./types";

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "6. Share by link",
    nextStep: "stepWebsite",
    component: () => (
      <div>Share your work with a simple link (not yet available)</div>
    ),
  };

  return step;
};

export default getStep;

import { Step } from "../components/wizard/types";
import { StepName, Result } from "./types";

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "... or by pivot",
    nextStep: "stepTransform",
    component: () => (
      <div>... or by configuring a pivot table (not yet available)</div>
    ),
  };

  return step;
};

export default getStep;

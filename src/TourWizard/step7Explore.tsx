import { Step } from "../components/wizard/types";
import { StepName, Result } from "./types";

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "7. Now everybody",
    nextStep: undefined,
    component: () => (
      <div>
        Your users will be able to open your chart within ownership with a
        simple click and start to explore the data for themselves. Maybe they'll
        produce new, interesting results!
      </div>
    ),
  };

  return step;
};

export default getStep;

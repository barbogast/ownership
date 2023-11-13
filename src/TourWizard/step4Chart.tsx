import { Step } from "../components/wizard/types";
import TourImage from "./TourImage";
import { StepName, Result } from "./types";
import imageChart from "./images/chart.png";

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "4. Configure chart",
    nextStep: "stepGit",
    component: () => (
      <div>
        Configure your chart
        <TourImage src={imageChart} />
      </div>
    ),
  };

  return step;
};

export default getStep;

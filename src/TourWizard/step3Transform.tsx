import { Step } from "../components/wizard/types";
import TourImage from "./TourImage";
import { StepName, Result } from "./types";
import imageTransform from "./images/transform.png";

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "3. Transform (optional)",
    nextStep: "stepChart",
    component: () => (
      <div>
        When SQL is not enough you can transform your data after querying it
        using Typescript code
        <TourImage src={imageTransform} />
      </div>
    ),
  };

  return step;
};

export default getStep;

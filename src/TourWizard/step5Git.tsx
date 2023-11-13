import { Step } from "../components/wizard/types";
import TourImage from "./TourImage";
import { StepName, Result } from "./types";
import imageGit from "./images/git.png";

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "5. Save with Git",
    nextStep: "stepShare",
    component: () => (
      <div>
        Create a repository on Github (or other git hosters) and save your work
        there
        <TourImage src={imageGit} />
      </div>
    ),
  };

  return step;
};

export default getStep;

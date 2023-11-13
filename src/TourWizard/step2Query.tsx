import imageSql from "./images/sql.png";
import { Step } from "../components/wizard/types";
import { StepName, Result } from "./types";
import TourImage from "./TourImage";

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "2. Query",
    nextStep: "stepTransform",
    component: () => (
      <div>
        Query your data by writing an SQL query.
        <TourImage src={imageSql} />
        <div>... or by configuring a pivot table (not yet available)</div>
      </div>
    ),
  };

  return step;
};

export default getStep;

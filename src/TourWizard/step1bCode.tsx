import imageCode from "./images/code.png";
import { Step } from "../components/wizard/types";
import { StepName, Result } from "./types";
import TourImage from "./TourImage";

// Example code for screenshot
/*
type Value = string | number | null | undefined
type Row = Record<string, Value>
type Columns = { name: string, type: "text" | "integer" | "real" }[]
type ReturnValue = {data: Row[], columns: Columns}

async function execute(): Promise<ReturnValue> {
  const res = await fetch('https://yourwebsite.com/api/v1/weather')
  const data = await res.json()

  const preparedData = data.map(row => ({tempCelsius: (row.tempFahrenheit - 32) * 5 / 9, date: row.date}))
  return {data: preparedData, columns: [{name: 'tempCelsius', type: 'real'}, {name: 'date', type: 'text'}]}
}
*/

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "... or from a script",
    nextStep: "stepSql",
    component: () => (
      <div>
        ... or write a script to generate the data, for example by fetching it
        from a third-party API.
        <TourImage src={imageCode} />
      </div>
    ),
  };

  return step;
};

export default getStep;

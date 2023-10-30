import { Radio } from "antd";
import { Step } from "../components/wizard/types";
import { StepName, StepResult } from "./types";

const getStep = () => {
  const step: Step<StepName, StepResult> = {
    type: "component",
    label: "Import source",
    nextStep: {
      resultKey: "source",
      resultValueMappings: [
        { value: "csv", stepName: "parseCsv" },
        { value: "code", stepName: "code" },
      ],
    },
    component: ({ results, setResults }) => {
      return (
        <Radio.Group
          onChange={(event) =>
            setResults((results) => ({
              ...results,
              source: event.target.value,
            }))
          }
          value={results.source}
        >
          <Radio value="csv">Import from CSV</Radio>
          <Radio value="code">Run script</Radio>
        </Radio.Group>
      );
    },
  };

  return step;
};

export default getStep;

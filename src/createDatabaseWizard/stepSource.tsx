import { Radio } from "antd";
import { Step } from "../components/wizard/types";
import { Source, StepName, StepResult } from "./types";
import { sourceToStepMapping } from "./utils";

const getStep = () => {
  const step: Step<StepName, StepResult> = {
    type: "component",
    label: "Import source",
    nextStep: {
      resultKey: "source",
      resultValueMappings: Object.entries(sourceToStepMapping).map(
        ([source, stepName]) => ({ value: source, stepName })
      ),
    },
    component: ({ results, setResults }) => {
      return (
        <Radio.Group
          onChange={(event) =>
            setResults((results) => ({
              ...results,
              source: event.target.value as Source,
            }))
          }
          value={results.source}
        >
          <Radio value="csv">Import from CSV</Radio>
          <Radio value="json">Import from JSON</Radio>
          <Radio value="code">Run script</Radio>
        </Radio.Group>
      );
    },
  };

  return step;
};

export default getStep;

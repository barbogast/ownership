import { Checkbox, Radio } from "antd";
import { Step } from "../components/wizard/types";
import { Source } from "../databaseDefinition/databaseDefinitionStore";
import { StepName, StepResult } from "./types";
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
        <>
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
            <br />
            <Radio value="json">Import from JSON</Radio>
            <br />
            <Radio value="code">Run script</Radio>
            <br />
          </Radio.Group>
          <br />
          <br />
          {["csv", "json"].includes(results.source) && (
            <Checkbox
              onChange={(event) =>
                setResults((results) => ({
                  ...results,
                  enablePostProcessing: event.target.checked,
                }))
              }
              value={results.enablePostProcessing}
            >
              Enable post-processing
            </Checkbox>
          )}
        </>
      );
    },
  };

  return step;
};

export default getStep;

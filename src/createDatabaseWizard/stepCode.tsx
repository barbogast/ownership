import { useState } from "react";

import { Step, WizardStepComponent } from "../components/wizard/types";
import { StepName, StepResult } from "./types";
import CodeEditor from "../components/CodeEditor";
import { Button } from "antd";
import { ExecutionResult } from "../codeExecution/types";
import TableDisplay from "../display/TableDisplay";
import {
  ReturnValue,
  defaultCode,
  execute,
} from "../codeExecution/importFromCode";
import { stableStringify } from "../util/json";

// eslint-disable-next-line react-refresh/only-export-components
const Code: WizardStepComponent<StepResult> = ({ results, setResults }) => {
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult<ReturnValue>>();

  const executeCode = async () => {
    const executionResult = await execute(results.importCode);
    setExecutionResult(executionResult);
    if (executionResult.success) {
      const { data, columns } = executionResult.returnValue;
      setResults((state) => ({
        ...state,
        jsonContent: stableStringify(data),
        columns: columns.map((c) => ({
          sourceName: c.name,
          dbName: c.name,
          type: c.type,
        })),
      }));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1 }}>
        <CodeEditor
          code={results.importCode || defaultCode}
          setCode={(value) =>
            setResults((state) => ({ ...state, code: value }))
          }
          error={
            executionResult && !executionResult.success
              ? executionResult.error
              : undefined
          }
        />
      </div>
      <div>
        <Button onClick={executeCode}>Execute</Button>
      </div>
      {executionResult?.success && (
        <TableDisplay transformResult={executionResult.returnValue.data} />
      )}
    </div>
  );
};

const getStep = () => {
  const step: Step<StepName, StepResult> = {
    type: "component",
    label: "Run code",
    nextStep: "configureColumns",
    component: Code,
  };
  return step;
};

export default getStep;

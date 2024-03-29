import { useState } from "react";

import { Step, WizardStepComponent } from "../components/wizard/types";
import { StepName, StepResult } from "./types";
import CodeEditor from "../components/CodeEditor";
import { Button } from "antd";
import { ExecutionResult } from "../codeExecution/types";
import TableDisplay from "../display/TableDisplay";
import {
  ReturnValue,
  initialCode,
  execute,
} from "../codeExecution/importFromCode";
import { stableStringify } from "../util/json";
import { IMPORTED_FROM_CODE_FILE_NAME } from "../databaseDefinition/databaseDefinitionStore";

// eslint-disable-next-line react-refresh/only-export-components
const ImportFromCode: WizardStepComponent<StepResult> = ({
  results,
  setResults,
}) => {
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult<ReturnValue>>();

  const executeCode = async () => {
    const executionResult = await execute(results.importCode);
    setExecutionResult(executionResult);
    if (executionResult.success) {
      const data = executionResult.returnValue;
      setResults((state) => ({
        ...state,
        sourceFiles: { [IMPORTED_FROM_CODE_FILE_NAME]: stableStringify(data) },
        json: { finalContent: data },
      }));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1 }}>
        <CodeEditor
          code={results.importCode || initialCode.trim()}
          setCode={(value) =>
            setResults((state) => ({ ...state, importCode: value }))
          }
          error={
            executionResult && !executionResult.success
              ? executionResult.error
              : undefined
          }
        />
      </div>
      <div>
        <Button onClick={executeCode}>Preview</Button>
      </div>
      {executionResult?.success && (
        <div data-testid="preview">
          <TableDisplay transformResult={executionResult.returnValue} />
        </div>
      )}
    </div>
  );
};

const getStep = () => {
  const step: Step<StepName, StepResult> = {
    type: "component",
    label: "Run code",
    nextStep: "configureColumns",
    component: ImportFromCode,
  };
  return step;
};

export default getStep;

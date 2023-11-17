import { useState } from "react";
import Papa from "papaparse";

import { Step, WizardStepComponent } from "../components/wizard/types";
import { StepName, StepResult } from "./types";
import CodeEditor from "../components/CodeEditor";
import { Button } from "antd";
import { ExecutionResult } from "../util/codeExecution";
import TableDisplay from "../display/TableDisplay";
import { objectsToRows } from "../util/transform";
import {
  ReturnValue,
  defaultCode,
  execute,
} from "../codeExecution/importFromCode";

// eslint-disable-next-line react-refresh/only-export-components
const Code: WizardStepComponent<StepResult> = ({ results, setResults }) => {
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult<ReturnValue>>();

  const executeCode = async () => {
    const executionResult = await execute(results.code);
    setExecutionResult(executionResult);
    if (executionResult.success) {
      const { data, columns } = executionResult.returnValue;

      const headerRow = columns.map((c) => c.name);
      const dataRows = objectsToRows(data, headerRow);
      const parsedCsvContent = [headerRow, ...dataRows];

      setResults((state) => ({
        ...state,
        csvContent: Papa.unparse(parsedCsvContent, { newline: "\n" }),
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
          code={results.code || defaultCode}
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

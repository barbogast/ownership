import { useState } from "react";
import Papa from "papaparse";

import { Step, WizardStepComponent } from "../components/wizard/types";
import { StepName, StepResult } from "./types";
import CodeEditor from "../components/CodeEditor";
import { Button } from "antd";
import { ExecutionResult, executeTypescriptCode } from "../util/codeExecution";
import TableDisplay from "../display/TableDisplay";
import { TransformResult } from "../types";
import { objectsToRows } from "../util/transform";
import { ColumnType } from "../util/database";

type CodeReturnValue = {
  data: TransformResult;
  columns: { name: string; type: ColumnType }[];
};

const defaultCode = `
type Value = string | number | null | undefined
type Row = Record<string, Value>
type Columns = { name: string, type: "text" | "integer" | "real" }[]
type ReturnValue = {data: Row[], columns: Columns}

function execute(): ReturnValue {
  // Your code here ...
  return {data: [], columns: []}
}

`;

// eslint-disable-next-line react-refresh/only-export-components
const Code: WizardStepComponent<StepResult> = ({ results, setResults }) => {
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult<CodeReturnValue>>();

  const executeCode = async () => {
    const executionResult = await executeTypescriptCode<CodeReturnValue>(
      results.code,
      "execute",
      {}
    );
    setExecutionResult(executionResult);
    if (executionResult.success) {
      const { data, columns } = executionResult.returnValue;

      const headerRow = columns.map((c) => c.name);
      const dataRows = objectsToRows(data, headerRow);
      const parsedCsvContent = [headerRow, ...dataRows];

      setResults((state) => ({
        ...state,
        parsedCsvContent,
        csvContent: Papa.unparse(parsedCsvContent, { newline: "\n" }),
        columns: columns.map((c) => ({
          csvName: c.name,
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

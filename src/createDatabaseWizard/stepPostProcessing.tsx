import { useState } from "react";
import Papa from "papaparse";

import { Step, WizardStepComponent } from "../components/wizard/types";
import { StepName, StepResult } from "./types";
import CodeEditor from "../components/CodeEditor";
import { Button } from "antd";
import { ExecutionError } from "../util/codeExecution";
import TableDisplay from "../display/TableDisplay";
import { TransformResult } from "../types";
import { objectsToRows, rowsToObjects } from "../util/transform";
import { analyzeCsvHeader } from "../util/csv";
import { analyseJsonHeader } from "../util/json";
import * as postProcessCsv from "../codeExecution/postProcessCsv";
import * as postProcessJson from "../codeExecution/postProcessJson";

// eslint-disable-next-line react-refresh/only-export-components
const PostProcessing: WizardStepComponent<StepResult> = ({
  results,
  setResults,
}) => {
  const [previewData, setPreviewData] = useState<TransformResult>([]);
  const [error, setError] = useState<ExecutionError>();

  const executeCodeForCsv = async () => {
    setError(undefined);
    setPreviewData([]);
    const executionResult = await postProcessCsv.execute(
      results.postProcessingCode,
      { rows: results.parsedCsvContent! }
    );
    if (executionResult.success) {
      const columns = analyzeCsvHeader(executionResult.returnValue);

      setPreviewData(
        rowsToObjects({
          values: executionResult.returnValue,
          columns: columns.map((col) => col.sourceName),
        })
      );

      setResults((state) => ({
        ...state,
        parsedCsvContent: executionResult.returnValue,
        columns,
      }));
    } else {
      setError(executionResult.error);
    }
  };

  const executeCodeForJson = async () => {
    setError(undefined);
    setPreviewData([]);
    const executionResult = await postProcessJson.execute(
      results.postProcessingCode,
      {
        data: results.parsedJsonContent,
      }
    );
    if (executionResult.success) {
      setPreviewData(executionResult.returnValue);
      // const { data, columns } = executionResult.returnValue;

      const columns = analyseJsonHeader(executionResult.returnValue);
      const headerRow = columns.map((c) => c.sourceName);
      const dataRows = objectsToRows(executionResult.returnValue, headerRow);
      const parsedCsvContent = [headerRow, ...dataRows];

      setResults((state) => ({
        ...state,
        csvContent: Papa.unparse(parsedCsvContent, { newline: "\n" }),
        columns: columns,
      }));
    } else {
      setError(executionResult.error);
    }
  };

  const defaultCode =
    results.source === "csv"
      ? postProcessCsv.defaultCode
      : postProcessJson.defaultCode;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1 }}>
        <CodeEditor
          code={results.postProcessingCode || defaultCode}
          setCode={(value) =>
            setResults((state) => ({ ...state, postProcessingCode: value }))
          }
          error={error}
        />
      </div>
      <div>
        <Button
          onClick={
            results.source === "csv" ? executeCodeForCsv : executeCodeForJson
          }
        >
          Execute
        </Button>
      </div>
      {previewData && <TableDisplay transformResult={previewData} />}
    </div>
  );
};

const getStep = () => {
  const step: Step<StepName, StepResult> = {
    type: "component",
    label: "Run code",
    nextStep: "configureColumns",
    component: PostProcessing,
  };
  return step;
};

export default getStep;

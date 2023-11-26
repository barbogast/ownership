import { useState } from "react";
import { Step, WizardStepComponent } from "../components/wizard/types";
import { StepName, StepResult } from "./types";
import CodeEditor from "../components/CodeEditor";
import { Button } from "antd";
import { ExecutionError } from "../codeExecution/types";
import TableDisplay from "../display/TableDisplay";
import { TransformResult } from "../types";
import { analyzeHeader, arraysToObjects } from "../util/csv";
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
      { files: results.csv.beforePostProcessing! }
    );
    if (executionResult.success) {
      const columns = analyzeHeader(executionResult.returnValue);

      setPreviewData(arraysToObjects(executionResult.returnValue));

      setResults((state) => ({
        ...state,
        csv: { finalContent: executionResult.returnValue },
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
        files: results.json.beforePostProcessing!,
      }
    );
    if (executionResult.success) {
      setPreviewData(executionResult.returnValue);
      setResults((state) => ({
        ...state,
        json: { finalContent: executionResult.returnValue },
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
          code={results.postProcessingCode || defaultCode.trim()}
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
      {previewData && (
        <div data-testid="preview">
          <TableDisplay transformResult={previewData} />
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
    component: PostProcessing,
  };
  return step;
};

export default getStep;

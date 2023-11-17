import Papa from "papaparse";
import { Editor, OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";

import { forwardRef, useRef, useImperativeHandle } from "react";
import { Step } from "../components/wizard/types";
import { StepName, StepResult } from "./types";
import useLocalSettingsStore from "../localSettingsStore";
import { analyseJsonHeader, parseJson } from "../util/json";

const getStep = () => {
  const step: Step<StepName, StepResult> = {
    type: "forwardRefComponent",
    label: "Parse JSON",
    nextStep: {
      resultKey: "enablePostProcessing",
      resultValueMappings: [
        { value: true, stepName: "postProcessing" },
        { value: false, stepName: "configureColumns" },
      ],
    },
    forwardRefComponent: forwardRef(({ results }, parentRef) => {
      const editorRef = useRef<editor.IStandaloneCodeEditor>();
      const darkModeEnabled = useLocalSettingsStore(
        (state) => state.darkModeEnabled
      );

      const onEditorMount: OnMount = (editor) => {
        editorRef.current = editor;
      };

      useImperativeHandle(parentRef, () => ({
        getResult: (results) => ({
          ...results,
          jsonContent: editorRef.current!.getValue(),
        }),
      }));

      return (
        <Editor
          height="200px"
          defaultLanguage="json"
          defaultValue={results.jsonContent}
          onMount={onEditorMount}
          theme={darkModeEnabled ? "vs-dark" : undefined}
        />
      );
    }),
    submitStep: (results: StepResult) => {
      const result = parseJson(results.jsonContent);
      return {
        ...results,
        csvContent: Papa.unparse(result, { newline: "\n" }),
        parsedJsonContent: result,
        // If post-processing is enabled we can defer analyzing the columns until after the post-processing
        columns: results.enablePostProcessing ? [] : analyseJsonHeader(result),
      };
    },
  };
  return step;
};

export default getStep;

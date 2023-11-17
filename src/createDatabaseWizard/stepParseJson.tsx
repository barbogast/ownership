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
    nextStep: "configureColumns",
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
        columns: analyseJsonHeader(result),
      };
    },
  };
  return step;
};

export default getStep;

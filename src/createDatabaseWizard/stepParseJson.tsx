import { Editor, OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";

import { forwardRef, useRef, useImperativeHandle } from "react";
import { Step } from "../components/wizard/types";
import { StepName, StepResult } from "./types";
import useLocalSettingsStore from "../localSettingsStore";

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
      const result = JSON.parse(results.jsonContent);
      const jsonTypeToDbType = (value: unknown) => {
        switch (typeof value) {
          case "string":
            return "text";
          case "number":
            return value % 1 === 0 ? "integer" : "real";
          case "boolean":
            return "text";
          default:
            return "text";
        }
      };
      return {
        ...results,
        parsedContent: result,
        columns: Object.entries(result[0]).map(([key, value]) => ({
          sourceName: key,
          dbName: key,
          type: jsonTypeToDbType(value),
        })),
      };
    },
  };
  return step;
};

export default getStep;

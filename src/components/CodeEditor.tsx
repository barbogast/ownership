import { useEffect, useRef, useState } from "react";
import { editor as monaco } from "monaco-editor";
import { Editor, OnMount } from "@monaco-editor/react";

import { editorDefaultOptions } from "../constants";
import { ExecutionError } from "../codeExecution/types";
import useLocalSettingsStore from "../localSettingsStore";

type Props = {
  code: string;
  setCode: (code: string) => void;
  error?: ExecutionError;
};

const TransformSection: React.FC<Props> = ({ code, setCode, error }) => {
  const editorRef = useRef<monaco.IStandaloneCodeEditor>();
  const [monacoInstances, setMonacoInstances] = useState<{
    editor: monaco.IStandaloneCodeEditor;
    monaco: typeof import("../../node_modules/monaco-editor/esm/vs/editor/editor.api");
  }>();
  const darkModeEnabled = useLocalSettingsStore(
    (state) => state.darkModeEnabled
  );

  const onEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setMonacoInstances({ editor, monaco });

    const element = editor.getDomNode()!;

    // Don't propagate keyboard events to the parent element. This solves the issue of
    // antd's modal rerendering its content when `okType="primary"` and the user presses Enter.
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.stopPropagation();
      }
    });

    // https://github.com/microsoft/playwright/issues/14126#issuecomment-1728221169
    // attach an imperative method to the element so tests can programmatically update
    // the value of the editor without dealing with how Monaco handles the exact keystrokes
    // @ts-expect-error ...
    element.__uiTestingReplaceText = (find: string, replaceWith: string) => {
      editor.setValue(editor.getValue().replaceAll(find, replaceWith));
      // or however you want to mutate the underlying stored value...
      // you could change the editor's `model` instead
    };
  };

  useEffect(() => {
    if (error && error.position && monacoInstances) {
      const model = monacoInstances.editor.getModel()!;
      const marker = {
        message: error.error.message || "Error",
        severity: 8, // equals to monaco-editor/MarkerSeverity.Error
        // Importing MarkerSeverity is a bad idea as it will make vite bundle the entire monaco-editor package
        // (which is unnecessary is the files are loaded via CDN anyway)
        startLineNumber: error.position.line,
        endLineNumber: error.position.line,
        startColumn: 0,
        endColumn: code.split("\n")[error.position.line]?.length || 0,
      };
      monacoInstances.monaco.editor.setModelMarkers(model, "owner", [marker]);
    } else {
      monacoInstances?.monaco.editor.removeAllMarkers("owner");
    }
  }, [error, monacoInstances, code]);

  return (
    <Editor
      defaultLanguage="typescript"
      defaultValue={code}
      onChange={(value) => value && setCode(value)}
      onMount={onEditorMount}
      options={editorDefaultOptions}
      theme={darkModeEnabled ? "vs-dark" : undefined}
    />
  );
};

export default TransformSection;

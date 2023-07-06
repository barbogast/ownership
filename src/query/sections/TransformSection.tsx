import { Button } from "antd";
import { useEffect, useRef, useState } from "react";
import { editor as monaco, MarkerSeverity } from "monaco-editor";
import Editor, { OnMount } from "@monaco-editor/react";

import { useQuery, updateTransformCode } from "../queryStore";
import { QueryExecResult } from "../../dbStore";
import { editorDefaultOptions } from "../../constants";
import { TransformError } from "../../useQueryController";

type Props = {
  queryId: string;
  queryResults: QueryExecResult[];
  runTransform: (queryResults: QueryExecResult[]) => void;
  error: TransformError | undefined;
};

const TransformSection: React.FC<Props> = ({
  queryId,
  runTransform,
  queryResults,
  error,
}) => {
  const { transformCode } = useQuery(queryId);
  const editorRef = useRef<monaco.IStandaloneCodeEditor>();
  const [monacoInstances, setMonacoInstances] = useState<{
    editor: monaco.IStandaloneCodeEditor;
    monaco: typeof import("/Users/ben/git/ownership/node_modules/monaco-editor/esm/vs/editor/editor.api");
  }>();

  const onEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setMonacoInstances({ editor, monaco });
  };

  useEffect(() => {
    if (error?.position && monacoInstances) {
      const model = monacoInstances.editor.getModel()!;
      const marker = {
        message: error.error.message || "Error",
        severity: MarkerSeverity.Error,
        startLineNumber: error.position.line,
        endLineNumber: error.position.line,
        startColumn: 0,
        endColumn: transformCode.split("\n")[error.position.line].length,
      };
      monacoInstances.monaco.editor.setModelMarkers(model, "owner", [marker]);
    } else {
      monacoInstances?.monaco.editor.removeAllMarkers("owner");
    }
  }, [error, monacoInstances, transformCode]);

  return (
    <>
      <Editor
        height="500px"
        defaultLanguage="typescript"
        defaultValue={transformCode}
        onChange={(value) => value && updateTransformCode(queryId, value)}
        onMount={onEditorMount}
        options={editorDefaultOptions}
      />
      <br />
      <Button type="primary" onClick={() => runTransform(queryResults)}>
        Transform
      </Button>
    </>
  );
};

export default TransformSection;

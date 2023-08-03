import { Button } from "antd";
import { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { editor as monaco } from "monaco-editor";

import { Query, updateQuery } from "../queryStore";
import { QueryExecResult } from "../../databaseConnectionStore";
import { editorDefaultOptions } from "../../constants";
import { QueryState } from "../../useQueryController";

type Props = {
  query: Query;
  queryResults: QueryExecResult[];
  queryState: QueryState;
  runTransform: (queryResults: QueryExecResult[]) => void;
};

const TransformSection: React.FC<Props> = ({
  query,
  runTransform,
  queryResults,
  queryState,
}) => {
  const { transformCode } = query;
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
    if (
      queryState.state === "transformError" &&
      queryState.position &&
      monacoInstances
    ) {
      const model = monacoInstances.editor.getModel()!;
      const marker = {
        message: queryState.error.message || "Error",
        severity: 8, // equals to monaco-editor/MarkerSeverity.Error
        // Importing MarkerSeverity is a bad idea as it will make vite bundle the entire monaco-editor package
        // (which is unnecessary is the files are loaded via CDN anyway)
        startLineNumber: queryState.position.line,
        endLineNumber: queryState.position.line,
        startColumn: 0,
        endColumn:
          transformCode.split("\n")[queryState.position.line]?.length || 0,
      };
      monacoInstances.monaco.editor.setModelMarkers(model, "owner", [marker]);
    } else {
      monacoInstances?.monaco.editor.removeAllMarkers("owner");
    }
  }, [queryState, monacoInstances, transformCode]);

  return (
    <>
      <Editor
        height="500px"
        defaultLanguage="typescript"
        defaultValue={transformCode}
        onChange={(transformCode) =>
          transformCode && updateQuery(query.id, { transformCode })
        }
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

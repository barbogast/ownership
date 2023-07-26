import { useRef } from "react";
import { Alert, Button, Select } from "antd";
import { editor } from "monaco-editor";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { updateQuery, useQuery } from "./../queryStore";
import { QueryExecResult } from "../../databaseConnectionStore";
import TableDisplay from "../../display/TableDisplay";
import { editorDefaultOptions } from "../../constants";
import { rowsToObjects } from "../../util/transform";
import { Editor, OnMount } from "@monaco-editor/react";
import useDatabaseDefinitionStore from "../../databaseDefinition/databaseDefinitionStore";
import { QueryState } from "../../useQueryController";

type Props = {
  queryId: string;
  runQuery: (stmt: string) => void;
  queryResults: QueryExecResult[];
  queryState: QueryState;
};

const QuerySection: React.FC<Props> = ({
  queryId,
  runQuery,
  queryResults,
  queryState,
}) => {
  const { sqlStatement, databaseSource } = useQuery(queryId);
  const databases = useDatabaseDefinitionStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  const run = () => {
    const sel = editorRef.current!.getSelection();
    if (sel) {
      const selectedText = editorRef.current!.getModel()!.getValueInRange(sel);
      const fullText = editorRef.current!.getModel()!.getValue();
      runQuery(selectedText || fullText);
    }
  };

  const onEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.addAction({
      id: "executeQuery",
      label: "Execute query",
      keybindings: [
        // On macOS, listen to Command (⌘) + Enter key combination
        monaco.KeyMod.WinCtrl | monaco.KeyCode.Enter,
        // On Windows and Linux, you can use Ctrl + Enter key combination
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      ],
      run,
    });
  };

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={50} minSize={10}>
        <Select
          value={databaseSource?.url}
          onChange={(name) =>
            updateQuery(queryId, {
              databaseSource: { type: "local", url: name },
            })
          }
          options={Object.values(databases).map((db) => ({
            value: db.id,
            label: db.label,
          }))}
          style={{ width: 250 }}
          placeholder="Select database..."
        />
        <br />
        {queryState.state === "dbInitError" ? (
          <>
            Error initializing database
            <Alert message={queryState.errorMessage} type="error" />
          </>
        ) : (
          <>
            SQL:
            <Editor
              height="200px"
              defaultLanguage="sql"
              defaultValue={sqlStatement}
              onMount={onEditorMount}
              onChange={(sqlStatement) =>
                sqlStatement && updateQuery(queryId, { sqlStatement })
              }
              options={editorDefaultOptions}
            />
            <br />
            <br />
            <Button type="primary" onClick={run}>
              Run query
            </Button>
            <br />
            <br />
            {queryState.state === "dbQueryError" && (
              <Alert message={queryState.errorMessage} type="error" />
            )}
          </>
        )}
      </Panel>
      <PanelResizeHandle
        style={{ width: 10, background: "#f0f0f0", marginRight: 10 }}
      />
      <Panel minSize={10}>
        {queryResults.map((queryResult, i) => (
          <TableDisplay transformResult={rowsToObjects(queryResult)} key={i} />
        ))}
      </Panel>
    </PanelGroup>
  );
};

export default QuerySection;

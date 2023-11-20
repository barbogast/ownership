import { useRef } from "react";
import { Alert, Button, Select, Tabs, theme } from "antd";
import { editor } from "monaco-editor";
import { Editor, OnMount } from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Query, updateQuery } from "./../queryStore";
import TableDisplay from "../../display/TableDisplay";
import { editorDefaultOptions } from "../../constants";
import useDatabaseDefinitionStore from "../../databaseDefinition/databaseDefinitionStore";
import { QueryState } from "../../useQueryController";
import { TransformResult } from "../../types";
import useLocalSettingsStore from "../../localSettingsStore";
import DbSchemaDisplay from "../DbSchemaDisplay";
import { DbSchema } from "../../util/database";

type Props = {
  query: Query;
  runQuery: (stmt: string) => void;
  queryResults: TransformResult[];
  queryState: QueryState;
  dbSchema: DbSchema | undefined;
};

const { useToken } = theme;

const QuerySection: React.FC<Props> = ({
  query,
  runQuery,
  queryResults,
  queryState,
  dbSchema,
}) => {
  const { token } = useToken();
  const { sqlStatement, databaseSource } = query;
  const databases = useDatabaseDefinitionStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const darkModeEnabled = useLocalSettingsStore(
    (state) => state.darkModeEnabled
  );

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
          value={
            databaseSource.type === "local"
              ? databaseSource.id
              : databaseSource.url
          }
          onChange={(name) =>
            updateQuery(query.id, {
              databaseSource: { type: "local", id: name },
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
                sqlStatement && updateQuery(query.id, { sqlStatement })
              }
              options={editorDefaultOptions}
              theme={darkModeEnabled ? "vs-dark" : undefined}
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
        style={{ width: 10, background: token.colorSplit, marginRight: 10 }}
      />
      <Panel minSize={10}>
        <Tabs
          type="card"
          items={[
            {
              label: "Query Result",
              key: "preview",
              children: queryResults.map((queryResult, i) => (
                <TableDisplay transformResult={queryResult} key={i} />
              )),
            },
            {
              label: "Database schema",
              key: "schema",
              children: dbSchema ? (
                <DbSchemaDisplay dbSchema={dbSchema} />
              ) : (
                "Loading..."
              ),
            },
          ]}
        />
      </Panel>
    </PanelGroup>
  );
};

export default QuerySection;

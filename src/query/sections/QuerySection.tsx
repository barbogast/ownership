import { useRef } from "react";
import { Alert, Button, Select, Tabs, theme } from "antd";
import { editor } from "monaco-editor";
import { Editor, OnMount } from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Query, updateQuery } from "./../queryStore";
import TableDisplay from "../../display/TableDisplay";
import { editorDefaultOptions } from "../../constants";
import useDatabaseDefinitionStore from "../../databaseDefinition/databaseDefinitionStore";
import { ExecutionResult, QueryState } from "../../useQueryController";
import useLocalSettingsStore from "../../localSettingsStore";
import DbInfoDisplay from "../DbInfoDisplay";
import { DbInfo } from "../../util/database";

type Props = {
  query: Query;
  runQuery: (stmt: string) => void;
  queryResults: ExecutionResult;
  queryState: QueryState;
  dbSchema: DbInfo | undefined;
};

const { useToken } = theme;

const QuerySection: React.FC<Props> = ({
  query,
  runQuery,
  queryResults,
  queryState,
  dbSchema: dbInfo,
}) => {
  const { token } = useToken();
  const { sqlStatement, databaseSource } = query;
  const databases = useDatabaseDefinitionStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const darkModeEnabled = useLocalSettingsStore(
    (state) => state.darkModeEnabled
  );

  const run = () => {
    // Changes to the query are saved by the onChange handler of the <Editor /> component.
    // The user might directly run the initial query without changing anything, so we need to
    // make sure it is saved.
    updateQuery(query.id, {
      sqlStatement: editorRef.current!.getModel()!.getValue(),
    });

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

  const initialSqlCode = dbInfo?.tables[0]
    ? `SELECT * FROM ${dbInfo.tables[0].name}`
    : "";

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSizePercentage={50} minSizePercentage={10}>
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
              height="500px"
              defaultLanguage="sql"
              defaultValue={sqlStatement || initialSqlCode}
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
      <Panel minSizePercentage={10}>
        <Tabs
          type="card"
          items={[
            {
              label: "Query Result",
              key: "preview",
              children: queryResults && (
                <>
                  {queryResults.data.map((queryResult, i) => (
                    <TableDisplay transformResult={queryResult} key={i} />
                  ))}
                  <small style={{ textAlign: "right", display: "block" }}>
                    Execution time: {queryResults.executionTime.toFixed(3)}s
                  </small>
                </>
              ),
            },
            {
              label: "Database info",
              key: "schema",
              children: dbInfo ? (
                <DbInfoDisplay dbInfo={dbInfo} />
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

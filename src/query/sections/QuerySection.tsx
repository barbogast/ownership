import { useRef } from "react";
import { Button, Select } from "antd";
import { editor } from "monaco-editor";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { updateQuery, useQuery } from "./../queryStore";
import { QueryExecResult } from "../../databaseConnectionStore";
import TableDisplay from "../../display/TableDisplay";
import { editorDefaultOptions } from "../../constants";
import { rowsToObjects } from "../../util/transform";
import { Editor, OnMount } from "@monaco-editor/react";
import useDatabaseSourceStore from "../../databaseSourceStore";

type Props = {
  queryId: string;
  runQuery: (stmt?: string) => void;
  queryResults: QueryExecResult[];
};

const QuerySection: React.FC<Props> = ({ queryId, runQuery, queryResults }) => {
  const { sqlStatement, databaseSource } = useQuery(queryId);
  const { databases } = useDatabaseSourceStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  const run = () => {
    const sel = editorRef.current!.getSelection();
    if (sel) {
      const text = editorRef.current!.getModel()!.getValueInRange(sel);
      runQuery(text || sqlStatement);
    }
  };

  const onEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
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
            value: db.name,
            label: db.name,
          }))}
          style={{ width: 250 }}
          placeholder="Select database..."
        />
        <br />
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

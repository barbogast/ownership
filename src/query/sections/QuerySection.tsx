import { useRef } from "react";
import { Button, Select } from "antd";
import { editor } from "monaco-editor";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { updateQuery, useQuery } from "./../queryStore";
import { QueryExecResult } from "../../dbStore";
import TableDisplay from "../../display/TableDisplay";
import { databaseFiles, editorDefaultOptions } from "../../constants";
import { rowsToObjects } from "../../transform";
import { Editor, OnMount } from "@monaco-editor/react";

type Props = {
  queryId: string;
  runQuery: (stmt?: string) => void;
  queryResults: QueryExecResult[];
};

const QuerySection: React.FC<Props> = ({ queryId, runQuery, queryResults }) => {
  const { databaseFileName, sqlStatement } = useQuery(queryId);
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
          value={databaseFileName}
          onChange={(databaseFileName) =>
            updateQuery(queryId, { databaseFileName })
          }
          options={databaseFiles.map((f) => ({ value: f, label: f }))}
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

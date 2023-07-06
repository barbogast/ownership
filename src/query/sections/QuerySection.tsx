import { useRef } from "react";
import { Button, Col, Row, Select } from "antd";
import { editor } from "monaco-editor";

import {
  updateDatabaseFileName,
  updateSqlStatement,
  useQuery,
} from "./../queryStore";
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
    <Row>
      <Col span={12}>
        <Select
          value={databaseFileName}
          onChange={(value) => updateDatabaseFileName(queryId, value)}
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
          onChange={(value) => value && updateSqlStatement(queryId, value)}
          options={editorDefaultOptions}
        />
        <br />
        <br />
        <Button type="primary" onClick={run}>
          Run query
        </Button>
      </Col>
      <Col span={12}>
        {queryResults.map((queryResult, i) => (
          <TableDisplay transformResult={rowsToObjects(queryResult)} key={i} />
        ))}
      </Col>
    </Row>
  );
};

export default QuerySection;

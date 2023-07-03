import { useRef } from "react";
import { Input, Button, Col, Row, Select } from "antd";
import { TextAreaRef } from "antd/es/input/TextArea";
import {
  updateDatabaseFileName,
  updateSqlStatement,
  useQuery,
} from "./../queryStore";
import { QueryExecResult } from "../../dbStore";
import TableDisplay from "../../display/TableDisplay";
import { queryExecResultToObjects } from "../utils";
import { databaseFiles } from "../../constants";

type Props = {
  queryId: string;
  runQuery: (stmt?: string) => void;
  queryResults: QueryExecResult[];
};

const QuerySection: React.FC<Props> = ({ queryId, runQuery, queryResults }) => {
  const { databaseFileName, sqlStatement } = useQuery(queryId);

  const textAreaRef = useRef<TextAreaRef>(null);

  const run = () => {
    const cursorStart =
      textAreaRef.current!.resizableTextArea!.textArea.selectionStart;
    const cursorEnd =
      textAreaRef.current!.resizableTextArea!.textArea.selectionEnd;

    runQuery(
      cursorStart !== cursorEnd
        ? sqlStatement.substring(cursorStart, cursorEnd)
        : undefined
    );
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
        <br />
        <Input.TextArea
          value={sqlStatement}
          onChange={(event) => updateSqlStatement(queryId, event.target.value)}
          style={{ width: 500 }}
          rows={5}
          styles={{ textarea: { fontFamily: "monospace" } }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.ctrlKey) {
              run();
            }
          }}
          ref={textAreaRef}
        />
        <br />
        <br />
        <Button type="primary" onClick={run}>
          Run query
        </Button>
      </Col>
      <Col span={12}>
        {queryResults.map((queryResult, i) => (
          <TableDisplay
            transformResult={queryExecResultToObjects(queryResult)}
            key={i}
          />
        ))}
      </Col>
    </Row>
  );
};

export default QuerySection;

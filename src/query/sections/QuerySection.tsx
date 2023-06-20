import { Input, Button, Col, Row, Select } from "antd";
import {
  updateDatabaseFileName,
  updateSqlStatement,
  useQuery,
} from "./../queryStore";
import { QueryExecResult } from "../../dbStore";
import TableDisplay from "../../display/TableDisplay";
import { queryExecResultToObjects } from "../utils";

type Props = {
  queryId: string;
  runQuery: () => void;
  queryResults: QueryExecResult[];
};

const files = ["database.sqlite", "database2.sqlite"];
const QuerySection: React.FC<Props> = ({ queryId, runQuery, queryResults }) => {
  const { databaseFileName, sqlStatement } = useQuery(queryId);

  return (
    <Row>
      <Col span={12}>
        <Select
          value={databaseFileName}
          onChange={(value) => updateDatabaseFileName(queryId, value)}
          options={files.map((f) => ({ value: f, label: f }))}
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
        />
        <br />
        <br />
        <Button type="primary" onClick={runQuery}>
          Run query
        </Button>
      </Col>
      <Col span={12}>
        {queryResults.map((queryResult, i) => (
          <TableDisplay
            columns={queryResult.columns}
            values={queryExecResultToObjects(queryResult)}
            key={i}
          />
        ))}
      </Col>
    </Row>
  );
};

export default QuerySection;

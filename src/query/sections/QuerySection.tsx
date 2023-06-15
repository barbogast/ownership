import { Input, Button, Col, Row } from "antd";
import { updateSqlStatement, useQuery } from "./../queryStore";
import { QueryExecResult } from "../../Db";
import TableDisplay from "../../display/TableDisplay";
import { queryExecResultToObjects } from "../utils";

type Props = {
  queryId: string;
  runQuery: () => void;
  queryResults: QueryExecResult[];
};

const QuerySection: React.FC<Props> = ({ queryId, runQuery, queryResults }) => {
  const { sqlStatement } = useQuery(queryId);

  return (
    <Row>
      <Col span={12}>
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

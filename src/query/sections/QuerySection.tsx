import { Input, Button } from "antd";
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
    <>
      SQL:{" "}
      <Input
        value={sqlStatement}
        onChange={(event) => updateSqlStatement(queryId, event.target.value)}
        style={{ width: 500 }}
      />
      <br />
      <br />
      <Button type="primary" onClick={runQuery}>
        Run query
      </Button>
      {queryResults.map((queryResult, i) => (
        <TableDisplay
          columns={queryResult.columns}
          values={queryExecResultToObjects(queryResult)}
          key={i}
        />
      ))}
    </>
  );
};

export default QuerySection;

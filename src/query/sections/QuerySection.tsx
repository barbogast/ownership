import { Input, Button } from "antd";
import QueryResult from "../../QueryResult";
import { updateSqlStatement, useQuery } from "./../queryStore";
import { QueryExecResult } from "../../Db";
import css from "./query.module.css";

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
      {queryResults.length ? (
        <div className={css.codedisplay}>
          <pre>
            {
              // results contains one object per select statement in the query
              queryResults.map(({ columns, values }, i) => (
                <QueryResult key={i} columns={columns} values={values} />
              ))
            }
          </pre>
        </div>
      ) : null}
    </>
  );
};

export default QuerySection;

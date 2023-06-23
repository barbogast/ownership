import React, { useEffect, useState } from "react";

import { QueryExecResult } from "../dbStore";
import { useQuery } from "../query/queryStore";
import PieChartDisplay from "../display/PieChartDisplay";
import BarChartDisplay from "../display/BarChartDisplay";
import { Link } from "wouter";
import TableDisplay from "../display/TableDisplay";
import { queryExecResultToObjects } from "../query/utils";
import { useDatabase } from "../dbStore";
import LineChartDisplay from "../display/LineChartDisplay";

type Props = {
  queryId: string;
  showEditLink: boolean;
};

const Chart: React.FC<Props> = ({ queryId, showEditLink }) => {
  const {
    id,
    databaseFileName,
    sqlStatement,
    transformCode,
    chartType,
    enableTransform,
  } = useQuery(queryId);
  const db = useDatabase(databaseFileName, true);
  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  const [transformResult, setTransformResult] = useState<
    Record<string, unknown>[]
  >([]);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (db.status !== "loaded" || !sqlStatement) {
      return;
    }

    try {
      const result = db.db.exec(sqlStatement);
      if (!result.length) {
        // DB query most probably resulted in an error
        return;
      }
      if (enableTransform) {
        const func = new Function("queryResult", transformCode);
        const transformResult = func(result);
        setTransformResult(transformResult);
      } else {
        setQueryResults(result);
      }
    } catch (err) {
      setError(err as Error);
    }
  }, [db, transformCode, sqlStatement, enableTransform]);
  return (
    <>
      <pre style={{ color: "red" }}>{(error || "").toString()}</pre>

      {chartType === "table" &&
        (enableTransform && transformResult ? (
          <TableDisplay
            columns={
              transformResult.length ? Object.keys(transformResult[0]) : []
            }
            values={transformResult}
          />
        ) : (
          queryResults.map((queryResult, i) => (
            <TableDisplay
              columns={queryResult.columns}
              values={queryExecResultToObjects(queryResult)}
              key={i}
            />
          ))
        ))}

      {chartType === "barChart" &&
        queryResults.map((queryResult, i) => (
          <BarChartDisplay queryResult={queryResult} key={i} />
        ))}

      {chartType === "pieChart" &&
        queryResults.map((queryResult, i) => (
          <PieChartDisplay queryResult={queryResult} key={i} />
        ))}

      {chartType === "lineChart" &&
        queryResults.map((queryResult, i) => (
          <LineChartDisplay queryResult={queryResult} key={i} />
        ))}

      {showEditLink && (
        <div style={{ textAlign: "right" }}>
          <Link href={`/query/${id}`}>
            <button>Edit</button>
          </Link>
        </div>
      )}
    </>
  );
};

export default Chart;

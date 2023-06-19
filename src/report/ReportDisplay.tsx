import React, { useEffect, useState } from "react";

import { QueryExecResult } from "../dbStore";
import { useQuery } from "../query/queryStore";
import PieChartDisplay from "../display/PieChartDisplay";
import BarChartDisplay from "../display/BarChartDisplay";
import { Link } from "wouter";
import TableDisplay from "../display/TableDisplay";
import { queryExecResultToObjects } from "../query/utils";
import { useDatabase } from "../dbStore";

type Props = {
  queryId: string;
  showEditLink: boolean;
};

const Chart: React.FC<Props> = ({ queryId, showEditLink }) => {
  console.log("asdfasf");
  const db = useDatabase("database.sqlite", true);

  const { id, sqlStatement, transformCode, chartType, enableTransform } =
    useQuery(queryId);
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
      console.log(error);
      setError(err as Error);
    }
    // Run this hook only once after the component mounted and the DB was initialised
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);

  return (
    <>
      <pre style={{ color: "red" }}>{(error || "").toString()}</pre>

      {chartType === "table" &&
        (enableTransform ? (
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

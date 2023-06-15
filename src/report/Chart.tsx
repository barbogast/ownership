import React, { useEffect, useState } from "react";
import { Table } from "antd";

import { useDb, QueryExecResult } from "../Db";
import { useQuery } from "../query/queryStore";
import { DataType } from "../types";
import PieChartDisplay from "../display/PieChartDisplay";
import BarChartDisplay from "../display/BarChartDisplay";
import { Link } from "wouter";

type Props = {
  queryId: string;
  showEditLink: boolean;
};

const Chart: React.FC<Props> = ({ queryId, showEditLink }) => {
  const db = useDb();

  const { id, sqlStatement, transformCode, chartType } = useQuery(queryId);
  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (!db || !sqlStatement) {
      return;
    }

    try {
      let result = db!.exec(sqlStatement);
      if (!result.length) {
        // DB query most probably resulted in an error
        return;
      }
      if (transformCode) {
        const func = new Function("queryResult", transformCode);
        result = func(result);
      }
      setQueryResults(result);
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
      {chartType === "table" && (
        <Table<DataType>
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
            },
            {
              title: "Value",
              dataIndex: "value",
              key: "value",
            },
          ]}
          rowSelection={{
            type: "checkbox",
            // onChange: (_, selectedDataSets) => {
            //   setSelected(selectedDataSets);
            // },
            checkStrictly: true,
          }}
          //   dataSource={postProcessResult}
        />
      )}
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

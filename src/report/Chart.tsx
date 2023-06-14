import React, { useEffect, useState } from "react";
import { Table } from "antd";

import { useDb, QueryExecResult } from "../Db";
import { useQuery } from "../query/queryStore";
import { DataType } from "../types";
import QueryPieChart from "../query/QueryPieChart";
import QueryBarChart from "../query/QueryBarChart";
import { Link } from "wouter";

type Props = {
  queryId: string;
  showEditLink: boolean;
};

const Chart: React.FC<Props> = ({ queryId, showEditLink }) => {
  const db = useDb();

  const { id, label, sqlStatement, transformCode, chartType } =
    useQuery(queryId);
  console.log("render chart", queryId, sqlStatement);

  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  console.log("queryResults", queryResults);

  const [error, setError] = useState<Error>();

  useEffect(() => {
    console.log("useEffect", Boolean(db));
    if (!db || !sqlStatement) {
      return;
    }
    console.log("useeefffect", 1);

    try {
      console.log("useeefffect", 2);
      let result = db!.exec(sqlStatement);
      if (!result.length) {
        // DB query most probably resulted in an error
        return;
      }
      console.log("useeefffect", 3);
      if (transformCode) {
        console.log("useeefffect", 4);
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
          <QueryBarChart queryResult={queryResult} key={i} />
        ))}

      {chartType === "pieChart" &&
        queryResults.map((queryResult, i) => (
          <QueryPieChart queryResult={queryResult} key={i} />
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

import React, { useEffect, useState } from "react";
import { Collapse, Button, Select, Input } from "antd";

import { useDb, QueryExecResult } from "../Db";
import QueryResult from "../QueryResult";
import {
  updateChartType,
  updateLabel,
  updateSqlStatement,
  updateTransformCode,
  useQuery,
} from "./queryStore";
import QueryPieChart from "./QueryPieChart";
import QueryBarChart from "./QueryBarChart";
import css from "./query.module.css";
import QueryTable from "./QueryTable";

type Progress = {
  queried?: boolean;
  postProcessed?: boolean;
};

type Panels = "query" | "transform" | "visualize";

type Props = {
  params: { queryId: string };
};

const queryExecResultToObjects = (queryResult: QueryExecResult) =>
  queryResult.values.map((row, i) => ({
    ...Object.fromEntries(queryResult.columns.map((k, i) => [k, row[i]])),
    key: i,
  }));

const Query: React.FC<Props> = ({ params: { queryId } }) => {
  const db = useDb();
  const [activePanel, setActivePanel] = useState<Panels>("query");
  const [progress, setProgress] = useState<Progress>({});

  const { label, sqlStatement, transformCode, chartType } = useQuery(queryId);

  const [enableTransform, setEnableTransform] = useState<boolean>(
    Boolean(transformCode)
  );

  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  const [postProcessResult, setPostProcessResult] = useState([]);

  const [error, setError] = useState<Error>();

  const runQuery = (): QueryExecResult[] => {
    try {
      setError(undefined);
      const results = db!.exec(sqlStatement);
      setQueryResults(results);
      setProgress({ queried: true });
      return results;
    } catch (err) {
      console.error(err);
      setError(err as Error);
      setQueryResults([]);
      return [];
    }
  };

  const runPostProcess = (results: QueryExecResult[]) => {
    try {
      const func = new Function("queryResult", transformCode);
      const result = func(results);
      setPostProcessResult(result);
      setProgress({ queried: true, postProcessed: true });
    } catch (err) {
      console.error(err);
      setError(err as Error);
    }
  };

  console.log(postProcessResult);

  useEffect(() => {
    if (!db || !sqlStatement) {
      return;
    }
    const results = runQuery();
    if (!results.length) {
      // DB query most probably resulted in an error
      return;
    }
    if (transformCode) {
      runPostProcess(results);
    }
    setActivePanel("visualize");
    // Run this hook only once after the component mounted and the DB was initialised
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);
  console.log(progress, activePanel);

  const items = [
    {
      key: "query",
      label: "Data Selection",
      children: (
        <>
          SQL:{" "}
          <Input
            value={sqlStatement}
            onChange={(event) =>
              updateSqlStatement(queryId, event.target.value)
            }
            style={{ width: 500 }}
          />
          <br />
          <br />
          <Button type="primary" onClick={runQuery}>
            Run query
          </Button>
          {progress.queried && (
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
          )}
        </>
      ),
    },
    {
      key: "transform",
      label: (
        <>
          <input
            type="checkbox"
            checked={enableTransform}
            onChange={() => setEnableTransform((state) => !state)}
          />
          {"   "}
          Optional: Data Transformation
        </>
      ),
      collapsible: progress.queried ? undefined : "disabled",
      children: (
        <>
          {enableTransform && (
            <>
              <br />
              <textarea
                value={transformCode}
                onChange={(event) =>
                  updateTransformCode(queryId, event.target.value)
                }
                className={css.codeinput}
              />
              <br />
              <Button
                type="primary"
                onClick={() => runPostProcess(queryResults)}
              >
                Transform
              </Button>
              <br />
            </>
          )}
          {progress.postProcessed && (
            <div className={css.codedisplay}>
              <pre>
                {/* results contains one object per select statement in the query */}
                {JSON.stringify(postProcessResult, null, 2)}
              </pre>
            </div>
          )}
        </>
      ),
    } as const,
    {
      key: "visualize",
      label: "Data Display",
      collapsible:
        progress.postProcessed || (!enableTransform && progress.queried)
          ? undefined
          : "disabled",
      children: (
        <>
          <Select
            value={chartType}
            onChange={(value) => updateChartType(queryId, value)}
            options={[
              { value: "barChart", label: "Bar chart" },
              { value: "pieChart", label: "Pie chart" },
              { value: "table", label: "Table" },
            ]}
            style={{ width: 120 }}
          />
          <br />
          <br />

          {chartType === "table" &&
            (enableTransform ? (
              <QueryTable
                columns={
                  postProcessResult.length
                    ? Object.keys(postProcessResult[0])
                    : []
                }
                values={postProcessResult}
              />
            ) : (
              queryResults.map((queryResult, i) => (
                <QueryTable
                  columns={queryResult.columns}
                  values={queryExecResultToObjects(queryResult)}
                  key={i}
                />
              ))
            ))}

          {chartType === "barChart" &&
            queryResults.map((queryResult, i) => (
              <QueryBarChart queryResult={queryResult} key={i} />
            ))}

          {chartType === "pieChart" &&
            queryResults.map((queryResult, i) => (
              <QueryPieChart queryResult={queryResult} key={i} />
            ))}
        </>
      ),
    } as const,
  ];

  return (
    <div style={{ display: "block", flexDirection: "column" }}>
      <>
        <Input
          addonBefore="Label"
          value={label}
          onChange={(event) => updateLabel(queryId, event.target.value)}
          style={{ width: 500 }}
        />
        <br /> <br />
        <Collapse
          items={items}
          activeKey={activePanel}
          onChange={(expandedPanels) => {
            const expandedPanelsTyped = expandedPanels as Panels[];
            if (expandedPanelsTyped.includes("transform")) {
              setEnableTransform(true);
            }
            setActivePanel(expandedPanelsTyped.slice(-1)[0]);
          }}
        />
      </>
      <pre style={{ color: "red" }}>{(error || "").toString()}</pre>
    </div>
  );
};

export default Query;

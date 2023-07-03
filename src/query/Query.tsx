import React, { useEffect, useState } from "react";
import { Button, Col, Collapse, Input, Row, Tabs } from "antd";
import * as dayjs from "dayjs";

import useQueryStore, {
  TransformType,
  TransformConfig,
  duplicate,
  remove,
  updateLabel,
  useQuery,
} from "./queryStore";
import QuerySection from "./sections/QuerySection";
import TransformSection from "./sections/TransformSection";
import DisplaySection from "./sections/DisplaySection";
import { QueryExecResult, initializeDb, MyDatabase } from "../dbStore";
import { downloadFile } from "../utils";
import { useLocation } from "wouter";
import TransformConfigForm from "./TransformConfigForm";
import TableDisplay from "../display/TableDisplay";
import { SqlValue } from "sql.js";
import { TransformResult } from "../types";
import { useDeepCompareEffect } from "../useDeepCompareEffect";
import { columnsToObjects, rowsToObjects } from "../transform";

type Panels = "query" | "transform" | "visualize";

type Progress = {
  queried?: boolean;
  postProcessed?: boolean;
};

type Props = {
  params: { queryId: string };
};

const convertRows = (
  transformConfig: TransformConfig,
  queryResults: QueryExecResult[]
) => {
  const { dataOrientation, dataRowIndex, labelColumn } = transformConfig;
  // return queryResults[0].values[dataRowIndex]
  //   .map((v, i) => [v, i] as [SqlValue, number])
  //   .filter(([, i]) => i !== columns.indexOf(labelColumn))
  //   .map(([value, i]) => ({
  //     // label: `${columns[i]}: ${
  //     //   // TODO: in case of number columns it should display 0 instead of ""
  //     //   value === undefined || value === null ? "" : value
  //     // }`,
  //     label: columns[i],
  //     key: i,
  //     value: value,
  //   }));
  // return columns;
  //   .map((column, index) => ({ column, index }))
  //   .filter(({ column }) => column !== labelColumn)
  //   .map(({ column, index }) => ({
  //     ":::label:::": column,
  //     ...Object.fromEntries(
  //       values.map((row) => [
  //         values.length === 1 ? "value" : row[columns.indexOf(labelColumn)],
  //         row[index],
  //       ])
  //     ),
  //   }));
  return dataOrientation === "column"
    ? rowsToObjects(queryResults[0])
    : columnsToObjects(queryResults[0], labelColumn);
};

const convertColumns = (
  transformConfig: TransformConfig,
  queryResults: QueryExecResult[]
) => {
  const { columns, values } = queryResults[0];
  return values.map((row) =>
    Object.fromEntries(row.map((value, i) => [columns[i], value]))
  );
};

const applyTransformConfig = (
  transformConfig: TransformConfig,
  queryResults: QueryExecResult[],
  setResult: (res: TransformResult) => void,
  setProgress: (p: Progress) => void
) => {
  console.log("applyTransformConfig");
  if (!queryResults.length) {
    return;
  }
  const { dataOrientation } = transformConfig;
  const { columns, values } = queryResults[0];
  console.log(
    "ASDF",
    values.slice(1).map((row) => row.map((value, i) => [columns[i], value]))
  );
  // const data =
  //   dataOrientation === "row"
  //     ? queryResults[0].values[dataRowIndex]
  //         .map((v, i) => [v, i] as [SqlValue, number])
  //         .filter(([, i]) => i !== columns.indexOf(labelColumn))
  //         .map(([value, i]) => ({
  //           // label: `${columns[i]}: ${
  //           //   // TODO: in case of number columns it should display 0 instead of ""
  //           //   value === undefined || value === null ? "" : value
  //           // }`,
  //           label: columns[i],
  //           key: i,
  //           value: value,
  //         }))
  //     : // [
  //       //   Object.fromEntries(
  //       //     queryResults[0].values[0].map((value, i) => [columns[i], value])
  //       //   ),
  //       // ]
  //       // : values.map((row, i) => ({
  //       //     key: i,
  //       //     label: `${row[columns.indexOf(labelColumn)]}: ${row[
  //       //       columns.indexOf(valueColumn)
  //       //     ]?.toLocaleString()}`,
  //       //     value: row[columns.indexOf(valueColumn)],
  //       //   }));
  //       values.map((row) =>
  //         Object.fromEntries(row.map((value, i) => [columns[i], value]))
  //       );
  const data =
    dataOrientation === "row"
      ? convertRows(transformConfig, queryResults)
      : convertRows(transformConfig, queryResults);

  console.log("applyTransformConfig", data, { values });
  setResult(data);
  setProgress({ queried: true, postProcessed: true });
};

const runPostProcess = (
  results: QueryExecResult[],
  setResult: (res: TransformResult) => void,
  transformCode: string,
  setProgress: (p: Progress) => void,
  setError: (e: Error) => void
) => {
  try {
    const func = new Function("queryResult", transformCode);
    const result = func(results);
    setResult(result || []);
    setProgress({ queried: true, postProcessed: true });
  } catch (err) {
    console.error(err);
    setError(err as Error);
  }
};

const Query: React.FC<Props> = ({ params: { queryId } }) => {
  // const [activePanel, setActivePanel] = useState<Panels>("query");
  const [progress, setProgress] = useState<Progress>({});
  const [, setLocation] = useLocation();

  const [db, setDb] = useState<MyDatabase>({ status: "loading", key: "" });

  const query = useQuery(queryId);
  const {
    label,
    databaseFileName,
    sqlStatement,
    transformType,
    transformConfig,
    transformCode,
  } = query;

  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  const [postProcessResult, setPostProcessResult] = useState<TransformResult>(
    []
  );

  const [error, setError] = useState<Error>();

  const runQuery = (statement?: string): QueryExecResult[] => {
    if (db.status !== "loaded") throw new Error();

    try {
      setError(undefined);
      const results = db.db.exec(statement || sqlStatement);
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

  const exportQuery = () => {
    downloadFile(
      JSON.stringify(query),
      "application/json",
      `query_${query.id}_${dayjs().format("YYYY-MM-DD_HH:mm:ss")}.json`
    );
  };

  const removeQuery = () => {
    const removed = remove(queryId);
    if (removed) {
      setLocation("/");
    }
  };

  const duplicateQuery = () => {
    const id = duplicate(queryId);
    setLocation(`/query/${id}`);
  };

  useEffect(() => {
    const func = async () => {
      if (databaseFileName) {
        const db = await initializeDb(databaseFileName, true);
        setDb(db);
      }
    };
    func();
  }, [databaseFileName]);

  useEffect(() => {
    if (db.status !== "loaded" || !sqlStatement) {
      return;
    }
    const results = runQuery();
    if (!results.length) {
      // DB query most probably resulted in an error
      return;
    }

    // Run this hook only once after the component mounted and the DB was initialised
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.status]);

  useDeepCompareEffect(() => {
    console.log(1);
    if (transformType === "code") {
      console.log(3);
      runPostProcess(
        queryResults,
        setPostProcessResult,
        transformCode,
        setProgress,
        setError
      );
    } else {
      console.log(2);
      applyTransformConfig(
        transformConfig,
        queryResults,
        setPostProcessResult,
        setProgress
      );
    }
  }, [
    transformType,
    transformConfig,
    transformCode,
    queryResults,
    setPostProcessResult,
    setProgress,
    setError,
  ]);

  console.log({ postProcessResult });

  // const tranformedData = transformType === 'code' ? postProcessResult :
  const items = [
    {
      key: "query",
      label: "Data Selection",
      children: (
        <QuerySection
          queryId={queryId}
          runQuery={runQuery}
          queryResults={queryResults}
        />
      ),
    },
    {
      key: "transform",
      // label: (
      //   <>
      //     <input
      //       type="checkbox"
      //       checked={enableTransform}
      //       onChange={() => updateEnableTransform(queryId, !enableTransform)}
      //     />
      //     {"   "}
      //     Optional: Data Transformation
      //   </>
      // ),
      label: "Transform",
      collapsible: progress.queried ? undefined : "disabled",
      children: (
        <Row>
          <Col span={12}>
            <Tabs
              onChange={(key) => {
                useQueryStore.setState((state) => {
                  state.queries[queryId].transformType = key as TransformType;
                });
              }}
              type="card"
              items={[
                {
                  label: "Config",
                  key: "config",
                  children: (
                    <TransformConfigForm
                      queryId={queryId}
                      queryResults={queryResults}
                    />
                  ),
                },
                {
                  label: "Code",
                  key: "code",
                  children: (
                    <TransformSection
                      queryId={queryId}
                      queryResults={queryResults}
                      runPostProcess={() =>
                        runPostProcess(
                          queryResults,
                          setPostProcessResult,
                          transformCode,
                          setProgress,
                          setError
                        )
                      }
                    />
                  ),
                },
              ]}
            />
          </Col>
          <Col span={12}>
            {postProcessResult.length ? (
              <TableDisplay transformResult={postProcessResult} />
            ) : null}
          </Col>
        </Row>
      ),
    } as const,
    {
      key: "visualize",
      label: "Data Display",
      collapsible: progress.postProcessed ? undefined : "disabled",
      children: (
        <DisplaySection
          queryId={queryId}
          postProcessResult={postProcessResult}
        />
      ),
    } as const,
  ];

  return (
    <div style={{ display: "block", flexDirection: "column" }}>
      <>
        <Row>
          <Col span={12}>
            <Input
              addonBefore="Label"
              value={label}
              onChange={(event) => updateLabel(queryId, event.target.value)}
              style={{ width: 500 }}
            />
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Button onClick={removeQuery}>Delete...</Button>{" "}
            <Button onClick={duplicateQuery}>Duplicate</Button>{" "}
            <Button onClick={exportQuery}>Export</Button>
          </Col>
        </Row>
        <br /> <br />
        <Collapse
          items={items}
          // activeKey={activePanel}
          // onChange={(expandedPanels) => {
          //   const expandedPanelsTyped = expandedPanels as Panels[];
          //   if (expandedPanelsTyped.includes("transform")) {
          //     updateEnableTransform(queryId, true);
          //   }
          //   setActivePanel(expandedPanelsTyped.slice(-1)[0]);
          // }}
        />
      </>
      <pre style={{ color: "red" }}>{(error || "").toString()}</pre>
    </div>
  );
};

export default Query;

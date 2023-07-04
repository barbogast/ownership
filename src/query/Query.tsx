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
import { TransformResult } from "../types";
import { columnsToObjects, rowsToObjects } from "../transform";

type Progress = {
  queried?: boolean;
  postProcessed?: boolean;
};

type Props = {
  params: { queryId: string };
};

const Query: React.FC<Props> = ({ params: { queryId } }) => {
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

  const runPostProcess = (
    results: QueryExecResult[],
    transformCode: string
  ) => {
    try {
      const func = new Function("queryResult", transformCode);
      const result = func(results);
      setPostProcessResult(result || []);
      setProgress({ queried: true, postProcessed: true });
    } catch (err) {
      console.error(err);
      setError(err as Error);
    }
  };

  const applyTransformConfig = (
    transformConfig: TransformConfig,
    queryResults: QueryExecResult[]
  ) => {
    if (!queryResults.length) {
      return;
    }
    const { dataOrientation, labelColumn } = transformConfig;

    const data =
      dataOrientation === "column"
        ? rowsToObjects(queryResults[0])
        : columnsToObjects(queryResults[0], labelColumn);

    setPostProcessResult(data);
    setProgress({ queried: true, postProcessed: true });
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

  useEffect(() => {
    if (transformType === "code") {
      if (queryResults.length) {
        runPostProcess(queryResults, transformCode);
      }
    } else {
      applyTransformConfig(transformConfig, queryResults);
    }
  }, [transformType, transformConfig, transformCode, queryResults]);

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
                        runPostProcess(queryResults, transformCode)
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
        <Collapse items={items} />
      </>
      <pre style={{ color: "red" }}>{(error || "").toString()}</pre>
    </div>
  );
};

export default Query;

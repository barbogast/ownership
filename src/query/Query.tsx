import React, { useEffect, useState } from "react";
import { Button, Col, Collapse, Input, Row } from "antd";

import {
  remove,
  updateEnableTransform,
  updateLabel,
  useQuery,
} from "./queryStore";
import QuerySection from "./sections/QuerySection";
import TransformSection from "./sections/TransformSection";
import DisplaySection from "./sections/DisplaySection";
import { QueryExecResult, initializeDb, MyDatabase } from "../dbStore";
import { downloadFile } from "../utils";
import { useLocation } from "wouter";

type Panels = "query" | "transform" | "visualize";

type Progress = {
  queried?: boolean;
  postProcessed?: boolean;
};

type Props = {
  params: { queryId: string };
};

const Query: React.FC<Props> = ({ params: { queryId } }) => {
  const [activePanel, setActivePanel] = useState<Panels>("query");
  const [progress, setProgress] = useState<Progress>({});
  const [, setLocation] = useLocation();

  const [db, setDb] = useState<MyDatabase>({ status: "loading", key: "" });

  const query = useQuery(queryId);
  const {
    label,
    databaseFileName,
    sqlStatement,
    enableTransform,
    transformCode,
  } = query;

  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  const [postProcessResult, setPostProcessResult] = useState([]);

  const [error, setError] = useState<Error>();

  const runQuery = (): QueryExecResult[] => {
    if (db.status !== "loaded") throw new Error();

    try {
      setError(undefined);
      const results = db.db.exec(sqlStatement);
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

  const exportQuery = () => {
    downloadFile(
      JSON.stringify(query),
      "application/json",
      `query_${query.id}.json`
    );
  };

  const removeQuery = () => {
    const removed = remove(queryId);
    if (removed) {
      setLocation("/");
    }
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
    if (transformCode) {
      runPostProcess(results);
    }
    setActivePanel("visualize");
    // Run this hook only once after the component mounted and the DB was initialised
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.status]);

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
      label: (
        <>
          <input
            type="checkbox"
            checked={enableTransform}
            onChange={() => updateEnableTransform(queryId, !enableTransform)}
          />
          {"   "}
          Optional: Data Transformation
        </>
      ),
      collapsible: progress.queried ? undefined : "disabled",
      children: (
        <TransformSection
          queryId={queryId}
          queryResults={queryResults}
          runPostProcess={runPostProcess}
          postProcessResult={postProcessResult}
        />
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
        <DisplaySection
          queryId={queryId}
          queryResults={queryResults}
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
            <Button onClick={exportQuery}>Export</Button>
          </Col>
        </Row>
        <br /> <br />
        <Collapse
          items={items}
          activeKey={activePanel}
          onChange={(expandedPanels) => {
            const expandedPanelsTyped = expandedPanels as Panels[];
            if (expandedPanelsTyped.includes("transform")) {
              updateEnableTransform(queryId, true);
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

import React from "react";
import { Button, Col, Collapse, Input, Row, Tabs } from "antd";
import * as dayjs from "dayjs";

import useQueryStore, {
  TransformType,
  duplicate,
  remove,
  updateLabel,
  useQuery,
} from "./queryStore";
import QuerySection from "./sections/QuerySection";
import TransformSection from "./sections/TransformSection";
import DisplaySection from "./sections/DisplaySection";
import { downloadFile } from "../utils";
import { useLocation } from "wouter";
import TransformConfigForm from "./TransformConfigForm";
import TableDisplay from "../display/TableDisplay";
import useQueryController from "../useQueryController";

type Props = {
  params: { queryId: string };
};

const Query: React.FC<Props> = ({ params: { queryId } }) => {
  const [, setLocation] = useLocation();

  const query = useQuery(queryId);
  const { label, transformCode } = query;

  const {
    error,
    progress,
    queryResults,
    runPostProcess,
    runQuery,
    postProcessResult,
  } = useQueryController(queryId);

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

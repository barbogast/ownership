import React from "react";
import { Button, Col, Collapse, Input, Row, Tabs } from "antd";
import * as dayjs from "dayjs";
import { useLocation } from "wouter";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import useQueryController from "../useQueryController";
import useQueryStore, {
  TransformType,
  duplicate,
  remove,
  updateQuery,
  useQuery,
} from "./queryStore";
import { downloadFile } from "../util/utils";
import QuerySection from "./sections/QuerySection";
import TransformSection from "./sections/TransformSection";
import DisplaySection from "./sections/DisplaySection";
import TransformConfigForm from "./TransformConfigForm";
import TableDisplay from "../display/TableDisplay";

type Props = {
  params: { queryId: string };
};

const Query: React.FC<Props> = ({ params: { queryId } }) => {
  const [, setLocation] = useLocation();

  const query = useQuery(queryId);
  const { label, transformCode, transformType } = query;

  const {
    error,
    progress,
    queryResults,
    runQuery,
    runTransform,
    transformResult,
    transformError,
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
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={10}>
            <Tabs
              onChange={(key) => {
                useQueryStore.setState((state) => {
                  state[queryId].transformType = key as TransformType;
                });
              }}
              activeKey={transformType}
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
                      runTransform={() =>
                        runTransform(queryResults, transformCode)
                      }
                      error={transformError}
                    />
                  ),
                },
              ]}
            />
          </Panel>
          <PanelResizeHandle
            style={{ width: 10, background: "#f0f0f0", marginRight: 10 }}
          />
          <Panel minSize={10}>
            {transformResult.length ? (
              <TableDisplay transformResult={transformResult} />
            ) : null}
          </Panel>
        </PanelGroup>
      ),
    } as const,
    {
      key: "visualize",
      label: "Data Display",
      collapsible: progress.transformed ? undefined : "disabled",
      children: (
        <DisplaySection queryId={queryId} transformResult={transformResult} />
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
              onChange={(event) =>
                updateQuery(queryId, { label: event.target.value })
              }
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

import React from "react";
import { Button, Col, Collapse, Input, Row, Tabs } from "antd";
import * as dayjs from "dayjs";
import { useLocation } from "wouter";
import { Panel, PanelGroup } from "react-resizable-panels";

import useQueryController from "../useQueryController";
import {
  TransformType,
  duplicate,
  remove,
  updateQuery,
  Query,
} from "./queryStore";
import { downloadFile } from "../util/utils";
import QuerySection from "./sections/QuerySection";
import DisplaySection from "./sections/DisplaySection";
import TransformConfigForm from "./TransformConfigForm";
import TableDisplay from "../display/TableDisplay";
import CodeEditor from "../components/CodeEditor";
import EditRawMenu from "./EditRawMenu";
import { initialCode } from "../codeExecution/transformQuery";
import ResizeHandle from "../components/ResizeHandle";

type Props = {
  query: Query;
};

const Query: React.FC<Props> = ({ query }) => {
  const [, setLocation] = useLocation();

  const controller = useQueryController(query);

  const { label, transformCode, transformType } = query;
  const {
    queryState,
    progress,
    queryResults,
    runQuery,
    runTransform,
    transformResult,
    dbSchema,
  } = controller;

  const exportQuery = () => {
    downloadFile(
      JSON.stringify(query),
      "application/json",
      `query_${query.id}_${dayjs().format("YYYY-MM-DD_HH:mm:ss")}.json`
    );
  };

  const removeQuery = () => {
    const removed = remove(query.id);
    if (removed) {
      setLocation("/");
    }
  };

  const duplicateQuery = () => {
    const id = duplicate(query.id);
    setLocation(`/query/${id}`);
  };

  const items = [
    {
      key: "query",
      label: "Data Selection",
      children: (
        <QuerySection
          query={query}
          runQuery={runQuery}
          queryResults={queryResults}
          queryState={queryState}
          dbSchema={dbSchema}
        />
      ),
    },
    {
      key: "transform",
      label: "Transform",
      collapsible: progress.queried ? undefined : "disabled",
      children: (
        <PanelGroup direction="horizontal">
          <Panel defaultSizePercentage={50} minSizePercentage={10}>
            <Tabs
              onChange={(key) =>
                updateQuery(query.id, { transformType: key as TransformType })
              }
              activeKey={transformType}
              type="card"
              items={[
                {
                  label: "Config",
                  key: "config",
                  children: (
                    <TransformConfigForm
                      query={query}
                      transformResult={transformResult}
                    />
                  ),
                },
                {
                  label: "Code",
                  key: "code",
                  children: (
                    <div style={{ height: 300 }}>
                      <CodeEditor
                        code={query.transformCode || initialCode.trim()}
                        setCode={(code) =>
                          updateQuery(query.id, { transformCode: code })
                        }
                        error={
                          queryState.state === "transformError"
                            ? queryState.error
                            : undefined
                        }
                      />
                      <br />
                      <Button
                        type="primary"
                        onClick={() =>
                          queryResults &&
                          runTransform(queryResults.data, transformCode)
                        }
                      >
                        Transform
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </Panel>
          <ResizeHandle />
          <Panel minSizePercentage={10}>
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
        <DisplaySection query={query} transformResult={transformResult} />
      ),
    } as const,
  ];

  return (
    <div
      style={{
        display: "block",
        flexDirection: "column",
        marginTop: 10,
        marginRight: 10,
      }}
    >
      <>
        <Row>
          <Col span={12}>
            <Input
              addonBefore="Label"
              value={label}
              onChange={(event) =>
                updateQuery(query.id, { label: event.target.value })
              }
              style={{ width: 500 }}
            />
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Button onClick={removeQuery}>Delete...</Button>{" "}
            <Button onClick={duplicateQuery}>Duplicate</Button>{" "}
            <Button onClick={exportQuery}>Export</Button>
            <EditRawMenu query={query} />
          </Col>
        </Row>
        <br /> <br />
        <Collapse items={items} />
      </>
    </div>
  );
};

export default Query;

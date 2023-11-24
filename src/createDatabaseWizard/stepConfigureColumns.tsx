import { Input, Row, Col, Select, Space } from "antd";
import { Step } from "../components/wizard/types";
import { StepName, StepResult } from "./types";
import { analyzeHeader } from "../util/csv";
import { analyseJsonHeader } from "../util/json";

const getStep = () => {
  const step: Step<StepName, StepResult> = {
    type: "component",
    label: "Configure Columns",
    nextStep: "configureDatabase",
    prepareStep: (results) => {
      switch (results.source) {
        case "csv":
          return {
            ...results,
            columns: analyzeHeader(results.csv.finalContent!),
          };
        case "json":
        case "code":
          return {
            ...results,
            columns: analyseJsonHeader(results.json.finalContent!),
          };
      }
    },
    component: ({ results, setResults }) => {
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Row gutter={[0, 10]}>
            <Col span={8}>
              <strong>Column name in CSV</strong>
            </Col>
            <Col span={8}>
              <strong>Column name in database</strong>
            </Col>
            <Col span={8}>
              <strong>Data type in database</strong>
            </Col>
          </Row>
          {results.columns.map((col, i) => (
            <Row key={i} data-testid="column-row">
              <Col span={8}>{col.sourceName}</Col>
              <Col span={8}>
                <Input
                  value={col.dbName}
                  onChange={(event) => {
                    setResults((state) => ({
                      ...state,
                      columns: state.columns.map((c, i2) =>
                        i === i2 ? { ...c, dbName: event.target.value } : c
                      ),
                    }));
                  }}
                  style={{ width: 250 }}
                />
              </Col>
              <Col span={8}>
                <Select
                  value={col.type}
                  onChange={(value) => {
                    setResults((state) => ({
                      ...state,
                      columns: state.columns.map((c, i2) =>
                        i === i2 ? { ...c, type: value } : c
                      ),
                    }));
                  }}
                  style={{ width: 250 }}
                >
                  <option value="integer">Integer</option>
                  <option value="real">Real</option>
                  <option value="text">Text</option>
                </Select>
              </Col>
            </Row>
          ))}
        </Space>
      );
    },
  };

  return step;
};

export default getStep;

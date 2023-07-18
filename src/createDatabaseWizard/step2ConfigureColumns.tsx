import { Input, Row, Col, Select } from "antd";
import { Step } from "../wizard/types";
import { StepResult } from "./types";
import { Fragment } from "react";

const getStep = () => {
  const step: Step<StepResult> = {
    type: "component",
    label: "Configure Columns",
    component: ({ results, setResults }) => {
      return (
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
          {results.columns.map((col, i) => (
            <Fragment key={i}>
              <Col span={8}>{col.csvName}</Col>
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
            </Fragment>
          ))}
        </Row>
      );
    },
  };

  return step;
};

export default getStep;

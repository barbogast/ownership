import { useState } from "react";
import DataTable from "./DataTable";
import { DataType } from "../types";
import { Col, Row } from "antd";
import PieChart from "./PieChart";

import data from "../../data/data.json";
import MyBarChart from "./MyBarChart";
import { Db } from "../Db";

function App() {
  const [selected, setSelected] = useState<DataType[]>([]);

  return (
    <>
      <Row>{/* <Editor /> */}</Row>
      <Row>
        <Db>
          <Col span={24}>
            {/* <CsvImport /> */}
            {/* <SQLRepl /> */}
          </Col>
        </Db>
      </Row>
      <Row></Row>
      <Row>
        <Col span={12}>
          <DataTable setSelected={setSelected} data={data} />
        </Col>
        <Col span={12}>
          {selected.map((data) => (
            <PieChart data={data} />
          ))}
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div style={{ height: 500 }}>
            <MyBarChart data={data} />
          </div>
        </Col>
      </Row>
    </>
  );
}

export default App;

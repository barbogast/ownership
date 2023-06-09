import { useState } from "react";
import DataTable from "./DataTable";
import { DataType } from "./types";
import { Col, Row } from "antd";
import PieChart from "./PieChart";

import data from "../data/data.json";

function App() {
  const [selected, setSelected] = useState<DataType[]>([]);

  return (
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
  );
}

export default App;

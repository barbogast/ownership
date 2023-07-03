import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { QueryExecResult } from "../dbStore";
import { COLORS } from "../constants";
import { Select } from "antd";
import { useState } from "react";
import { TransformResult } from "../types";
import { TransformConfig } from "../query/queryStore";

type Props = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};
const LineChartDisplay: React.FC<Props> = ({
  transformResult,
  transformConfig,
}) => {
  // const { columns, values } = queryResult;
  // const [xAxisColumn, setXAxisColumn] = useState<string>(columns[0]);

  return (
    <>
      X axis:{" "}
      {/* <Select
        value={xAxisColumn}
        onChange={setXAxisColumn}
        options={columns.map((c) => ({ label: c, value: c }))}
        style={{ width: 120 }}
      /> */}
      <br />
      <br />
      <LineChart
        width={500}
        height={300}
        // data={values.map((row) =>
        //   Object.fromEntries(row.map((v, i) => [columns[i], v]))
        // )}
        data={transformResult}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={transformConfig.labelColumn} />
        <YAxis />
        <Tooltip />
        <Legend />
        {/* {columns
          .filter((c) => c !== xAxisColumn)
          .map((c, i) => (
            <Line key={i} type="monotone" dataKey={c} stroke={COLORS[i]} />
          ))} */}
        {Object.keys(transformResult[0])
          .filter((c) => transformConfig.selectedColumns.indexOf(c) !== -1)
          .map((c, i) => (
            <Line key={i} type="monotone" dataKey={c} stroke={COLORS[i]} />
          ))}
      </LineChart>
    </>
  );
};

export default LineChartDisplay;

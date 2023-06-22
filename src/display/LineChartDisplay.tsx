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

type Props = { queryResult: QueryExecResult };
const LineChartDisplay: React.FC<Props> = ({ queryResult }) => {
  const { columns, values } = queryResult;
  const [xAxisColumn, setXAxisColumn] = useState<string>(columns[0]);

  return (
    <>
      X axis:{" "}
      <Select
        value={xAxisColumn}
        onChange={setXAxisColumn}
        options={columns.map((c) => ({ label: c, value: c }))}
        style={{ width: 120 }}
      />
      <br />
      <br />
      <LineChart
        width={500}
        height={300}
        data={values.map((row) =>
          Object.fromEntries(row.map((v, i) => [columns[i], v]))
        )}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisColumn} />
        <YAxis />
        <Tooltip />
        <Legend />
        {columns
          .filter((c) => c !== xAxisColumn)
          .map((c, i) => (
            <Line key={i} type="monotone" dataKey={c} stroke={COLORS[i]} />
          ))}
      </LineChart>
    </>
  );
};

export default LineChartDisplay;

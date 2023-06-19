import { Tooltip } from "antd";
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar } from "recharts";
import { QueryExecResult } from "../dbStore";
import { COLORS } from "../constants";

type Props = { queryResult: QueryExecResult };
const BarChartDisplay: React.FC<Props> = ({ queryResult }) => {
  const { columns, values } = queryResult;
  return (
    <BarChart
      width={500}
      height={300}
      data={values.map((row) =>
        columns.reduce(
          (data, col, index) => ({
            ...data,
            [col]: row[index],
            name: row[0],
          }),
          {}
        )
      )}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      {columns
        .filter((col) => col !== "label")
        .map((col, i) => (
          <Bar
            key={i}
            dataKey={col}
            stackId="a"
            fill={COLORS[i % COLORS.length]}
          />
        ))}
    </BarChart>
  );
};

export default BarChartDisplay;

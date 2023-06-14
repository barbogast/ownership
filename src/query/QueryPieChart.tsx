import React from "react";
import { Cell, Pie, PieChart } from "recharts";
import { QueryExecResult } from "../Db";
import { COLORS } from "../constants";

type Props = { queryResult: QueryExecResult };
const QueryPieChart: React.FC<Props> = ({ queryResult }) => {
  const { columns, values } = queryResult;
  return (
    <PieChart width={600} height={400}>
      <Pie
        data={values[0].map((value, i) => ({
          name: "xxx" + i,
          key: i,
          value: value,
        }))}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={60}
        fill="#8884d8"
        label={({
          cx,
          cy,
          midAngle,
          innerRadius,
          outerRadius,
          value,
          index,
        }) => {
          const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
          const RADIAN = Math.PI / 180;

          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);

          return (
            <text
              x={x}
              y={y}
              textAnchor={x > cx ? "start" : "end"}
              dominantBaseline="central"
            >
              {columns[index] + ": " + value}
            </text>
          );
        }}
      >
        {values.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
};

export default QueryPieChart;

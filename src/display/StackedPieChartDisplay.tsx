import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { TransformResult } from "../types";
import { TransformConfig } from "../query/queryStore";
import { getColor } from "../util/utils";

type Props = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};
const StackedPieChart: React.FC<Props> = ({
  transformResult,
  transformConfig,
}) => {
  return (
    <ResponsiveContainer>
      <PieChart width={600} height={320}>
        {transformConfig.selectedColumns.map((column, i) => (
          <Pie
            key={i}
            data={transformResult}
            dataKey={column}
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={60 * (i + 1)}
            innerRadius={100 * i}
            fill="#8884d8"
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              ...props
            }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
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
                  {props[transformConfig.labelColumn]}
                </text>
              );
            }}
          >
            {transformConfig.selectedColumns.map((_, index) => (
              <Cell key={`cell-${index}`} fill={getColor(i)} />
            ))}
          </Pie>
        ))}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StackedPieChart;

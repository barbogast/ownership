import React from "react";
import { Cell, Pie, PieChart } from "recharts";
import { TransformResult } from "../types";
import { TransformConfig } from "../query/queryStore";
import { getColor } from "../util/utils";

type Props = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};
const PieChartDisplay: React.FC<Props> = ({
  transformResult,
  transformConfig,
}) => {
  return (
    <>
      <PieChart width={600} height={320}>
        <Pie
          data={transformResult.filter(
            ({ label }) => label !== transformConfig.labelColumn
          )}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={60}
          fill="#8884d8"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, label }) => {
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
                {label}
              </text>
            );
          }}
        >
          {transformResult.map((_, index) => (
            <Cell key={`cell-${index}`} fill={getColor(index)} />
          ))}
        </Pie>
      </PieChart>
    </>
  );
};

export default PieChartDisplay;

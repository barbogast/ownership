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
  const hasLabelColumn = transformConfig.labelColumn !== "--no-label-column--";

  const columns = hasLabelColumn ? Object.keys(transformResult[0]) : ["value"];

  return (
    <>
      <PieChart width={600} height={320}>
        {columns.map((column, i) => (
          <Pie
            key={column + i}
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
                  {hasLabelColumn
                    ? props[transformConfig.labelColumn]
                    : props["label"]}
                </text>
              );
            }}
          >
            {transformResult.map((_, index) => (
              <Cell key={`cell-${index}`} fill={getColor(index)} />
            ))}
          </Pie>
        ))}
      </PieChart>
    </>
  );
};

export default PieChartDisplay;

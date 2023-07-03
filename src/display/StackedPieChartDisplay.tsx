import React, { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { Select } from "antd";
import { QueryExecResult } from "../dbStore";
import { COLORS } from "../constants";
import { SqlValue } from "sql.js";
import { useReadOnly } from "../ReadonlyContext";
import { TransformResult } from "../types";
import { TransformConfig } from "../query/queryStore";

type Orientation = "row" | "column";

type Props = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};
const StackedPieChart: React.FC<Props> = ({
  transformResult,
  transformConfig,
}) => {
  // const readOnly = useReadOnly();
  // const { columns, values } = queryResult;

  // const defaults =
  //   columns.includes("value") && columns.includes("label")
  //     ? ({
  //         orientation: "column",
  //         valueColumnIndex: columns.indexOf("value"),
  //         labelColumnIndex: columns.indexOf("label"),
  //       } as const)
  //     : ({
  //         orientation: "row",
  //         valueColumnIndex: 0,
  //         labelColumnIndex: 0,
  //       } as const);

  // const [dataOrientation, setDataOrientation] = useState<Orientation>(
  //   defaults.orientation
  // );
  // const [valueColumnIndex, setValueColumnIndex] = useState<number>(
  //   defaults.valueColumnIndex
  // );
  // const [labelColumnIndex, setLabelColumnIndex] = useState<number>(
  //   defaults.labelColumnIndex
  // );

  // const [dataRowIndex, setdataRowIndex] = useState(0);

  // const chartData =
  //   dataOrientation === "row"
  //     ? values[dataRowIndex]
  //         .map((v, i) => [v, i] as [SqlValue, number])
  //         .filter(([, i]) => i !== labelColumnIndex)
  //         .map(([value, i]) => ({
  //           label: `${columns[i]}: ${
  //             // TODO: in case of number columns it should display 0 instead of ""
  //             value === undefined || value === null ? "" : value
  //           }`,
  //           key: i,
  //           value: value,
  //         }))
  //     : values.map((row, i) => ({
  //         key: i,
  //         label: `${row[labelColumnIndex]}: ${row[
  //           valueColumnIndex
  //         ]?.toLocaleString()}`,
  //         value: row[valueColumnIndex],
  //       }));
  // console.log("Pie", chartData);

  // if (!transformResult.length) {
  //   return null;
  // }

  const isSingleRow =
    transformConfig.dataOrientation === "row" &&
    Object.keys(transformResult[0]).length === 2;
  // const dataSets = transformConfig.dataOrientation === "row" ? transformResult

  const columns = isSingleRow ? ["value"] : transformConfig.selectedColumns;
  console.log({ transformResult, isSingleRow, columns });
  return (
    <>
      <PieChart width={600} height={320}>
        {columns.map((column, i) => (
          <Pie
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
                  {transformConfig.dataOrientation === "row"
                    ? props["label"]
                    : props[transformConfig.labelColumn]}
                </text>
              );
            }}
          >
            {Object.keys(transformResult[0]).map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        ))}
      </PieChart>
    </>
  );
};

export default StackedPieChart;

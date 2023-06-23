import React, { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { Select } from "antd";
import { QueryExecResult } from "../dbStore";
import { COLORS } from "../constants";
import { SqlValue } from "sql.js";
import { useReadOnly } from "../ReadonlyContext";

type Orientation = "row" | "column";

type Props = { queryResult: QueryExecResult };
const PieChartDisplay: React.FC<Props> = ({ queryResult }) => {
  const readOnly = useReadOnly();
  const { columns, values } = queryResult;

  const defaults =
    columns.includes("value") && columns.includes("label")
      ? ({
          orientation: "column",
          valueColumnIndex: columns.indexOf("value"),
          labelColumnIndex: columns.indexOf("label"),
        } as const)
      : ({
          orientation: "row",
          valueColumnIndex: 0,
          labelColumnIndex: 0,
        } as const);

  const [dataOrientation, setDataOrientation] = useState<Orientation>(
    defaults.orientation
  );
  const [valueColumnIndex, setValueColumnIndex] = useState<number>(
    defaults.valueColumnIndex
  );
  const [labelColumnIndex, setLabelColumnIndex] = useState<number>(
    defaults.labelColumnIndex
  );

  const [dataRowIndex, setdataRowIndex] = useState(0);

  const chartData =
    dataOrientation === "row"
      ? values[dataRowIndex]
          .map((v, i) => [v, i] as [SqlValue, number])
          .filter(([, i]) => i !== labelColumnIndex)
          .map(([value, i]) => ({
            label: `${columns[i]}: ${
              // TODO: in case of number columns it should display 0 instead of ""
              value === undefined || value === null ? "" : value
            }`,
            key: i,
            value: value,
          }))
      : values.map((row, i) => ({
          key: i,
          label: `${row[labelColumnIndex]}: ${row[
            valueColumnIndex
          ]?.toLocaleString()}`,
          value: row[valueColumnIndex],
        }));

  return (
    <>
      {readOnly && (
        <>
          Orientation of data:{" "}
          <Select
            value={dataOrientation}
            onChange={setDataOrientation}
            options={[
              { value: "column", label: "Values are in one column" },
              { value: "row", label: "Values are in one row" },
            ]}
            style={{ width: 220 }}
          />
          <br />
          <br />
          Column containing labels:
          <Select
            value={labelColumnIndex}
            onChange={setLabelColumnIndex}
            options={columns.map((col, index) => ({
              value: index,
              label: col,
            }))}
            style={{ width: 220 }}
          />
          <br />
          {dataOrientation === "column" && (
            <>
              Column containing data:
              <Select
                value={valueColumnIndex}
                onChange={setValueColumnIndex}
                options={columns.map((col, index) => ({
                  value: index,
                  label: col,
                }))}
                style={{ width: 220 }}
              />
              <br />
            </>
          )}
          {dataOrientation === "row" && (
            <>
              <br />
              Row to display:{" "}
              <Select
                value={dataRowIndex}
                onChange={setdataRowIndex}
                options={values.map((row, i) => ({
                  value: i,
                  label: `Row ${i + 1}: "${row[labelColumnIndex]}"`,
                }))}
                style={{ width: 220 }}
              />
            </>
          )}
        </>
      )}
      <PieChart width={300} height={220}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={60}
          fill="#8884d8"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, label }) => {
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
                {label}
              </text>
            );
          }}
        >
          {values.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </>
  );
};

export default PieChartDisplay;

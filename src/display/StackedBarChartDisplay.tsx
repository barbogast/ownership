import { Select, Tooltip } from "antd";
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar } from "recharts";
import { QueryExecResult } from "../dbStore";
import { COLORS } from "../constants";
import { useState } from "react";
import { SqlValue } from "sql.js";
import { useReadOnly } from "../ReadonlyContext";
import { TransformResult } from "../types";
import { TransformConfig } from "../query/queryStore";

type Props = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};
const StackedBarChart: React.FC<Props> = ({
  transformResult,
  transformConfig,
}) => {
  // const readOnly = useReadOnly();
  // const { columns, values } = queryResult;
  // console.log(queryResult);
  // return null;
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

  // console.log(
  //   "AHAH",
  //   Object.keys(transformResult[0])
  //     .filter((col) => col !== "label")
  //     .map((col, i) => {
  //       console.log("XXX", col);
  //       return (
  //         <Bar
  //           key={i}
  //           dataKey={col}
  //           stackId="a"
  //           fill={COLORS[i % COLORS.length]}
  //         />
  //       );
  //     })
  // );

  const columns =
    transformConfig.dataOrientation === "column" || true
      ? // ? transformResult.map((row) => {
        //     console.log("bbb", row, transformConfig.labelColumn);
        //     return row[transformConfig.labelColumn] as string;
        //   })
        transformConfig.selectedColumns
      : // : Object.keys(transformResult[0]).filter((col) => col !== "label");
        // transformResult.map((row) => row.label);
        ["value"];
  // Object.keys(transformResult[0]);

  console.log({ transformResult, columns });
  return (
    <>
      {/* {readOnly && (
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
      )} */}
      <BarChart
        width={500}
        height={300}
        // data={values.map((row) =>
        //   columns.reduce(
        //     (data, col, index) => ({
        //       ...data,
        //       [col]: row[index],
        //       name: row[0],
        //     }),
        //     {}
        //   )
        // )}
        data={transformResult}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {/* <XAxis dataKey={columns[labelColumnIndex]} /> */}
        <XAxis
          dataKey={
            transformConfig.dataOrientation === "row"
              ? "label"
              : transformConfig.labelColumn
          }
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {columns.map((col, i) => (
          <Bar
            key={i}
            dataKey={col}
            // dataKey={transformConfig.dataOrientation === "row" ? "value" : col}
            stackId="a"
            fill={COLORS[i % COLORS.length]}
          />
        ))}
        {/* {dataOrientation === "row"
          ? columns
              .filter((_, i) => i !== labelColumnIndex)
              .map((col, i) => (
                <Bar
                  key={i}
                  dataKey={col}
                  stackId="a"
                  fill={COLORS[i % COLORS.length]}
                />
              ))
          : values.map((row, i) => (
              <Bar
                key={i}
                dataKey={columns[i]}
                stackId="a"
                fill={COLORS[i % COLORS.length]}
              />
            ))} */}
      </BarChart>
    </>
  );
};

export default StackedBarChart;

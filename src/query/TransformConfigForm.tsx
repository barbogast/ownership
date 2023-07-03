import React from "react";
import { Checkbox, Select } from "antd";
import { QueryExecResult } from "../dbStore";
import { SqlValue } from "sql.js";
import { useReadOnly } from "../ReadonlyContext";
import useQueryStore, {
  updateDataOrientation,
  updateIsSingleDataset,
  useQuery,
} from "./queryStore";

type Props = { queryId: string; queryResults: QueryExecResult[] };
const TransformConfigForm: React.FC<Props> = ({ queryId, queryResults }) => {
  const { transformConfig } = useQuery(queryId);

  const {
    dataOrientation,
    selectedColumns,
    labelColumn,
    dataRowIndex,
    isSingleDataset,
  } = transformConfig;

  const { columns, values } = queryResults[0];

  const selectedColumnOptions =
    dataOrientation === "row"
      ? labelColumn && columns.indexOf(labelColumn) !== -1
        ? queryResults[0].values.map((row) => row[columns.indexOf(labelColumn)])
        : []
      : columns;

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

  // const [dataOrientation, setDataOrientation] = useState<Orientation>(
  //   defaults.orientation
  // );
  // const [valueColumnIndex, setValueColumnIndex] = useState<number>(
  //   defaults.valueColumnIndex
  // );
  // const [labelColumnIndex, setLabelColumnIndex] = useState<number>(
  //   defaults.labelColumnIndex
  // );

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

  return (
    <>
      Orientation of data:{" "}
      <Select
        value={dataOrientation}
        onChange={(value) => updateDataOrientation(queryId, value)}
        options={[
          { value: "column", label: "Values are in one column" },
          { value: "row", label: "Values are in one row" },
        ]}
        style={{ width: 220 }}
      />
      <br />
      <Checkbox
        checked={isSingleDataset}
        onChange={(event) =>
          updateIsSingleDataset(queryId, event.target.checked)
        }
      >
        Single dataset
      </Checkbox>
      <br />
      <br />
      <>
        Column containing labels:
        <Select
          value={labelColumn}
          onChange={(value) => {
            useQueryStore.setState((state) => {
              state.queries[queryId].transformConfig.labelColumn = value;
            });
          }}
          options={columns
            .map((col) => ({ value: col, label: col }))
            .concat({ value: "--no-label-column--", label: "No label column" })}
          style={{ width: 220 }}
        />
        <br />
      </>
      {/* {dataOrientation === "column" && ( */}
      <>
        Columns to display:
        {/* <Select
            value={valueColumn}
            onChange={(value) => {
              useQueryStore.setState((state) => {
                state.queries[queryId].transformConfig.valueColumn = value;
              });
            }}
            options={[{ value: "::all::", label: "All columns" }].concat(
              columns.map((col) => ({ value: col, label: col }))
            )}
            style={{ width: 220 }}
          /> */}
        <Checkbox.Group
          options={selectedColumnOptions}
          value={selectedColumns}
          onChange={(values) => {
            useQueryStore.setState((state) => {
              state.queries[queryId].transformConfig.selectedColumns =
                values as string[];
            });
          }}
        />
        <br />
      </>
    </>
  );
};

export default TransformConfigForm;

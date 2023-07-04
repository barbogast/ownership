import React from "react";
import { Checkbox, Select } from "antd";
import { QueryExecResult } from "../dbStore";
import useQueryStore, {
  updateDataOrientation,
  updateIsSingleDataset,
  useQuery,
} from "./queryStore";

type Props = { queryId: string; queryResults: QueryExecResult[] };
const TransformConfigForm: React.FC<Props> = ({ queryId, queryResults }) => {
  const { transformConfig } = useQuery(queryId);

  const { dataOrientation, selectedColumns, labelColumn, isSingleDataset } =
    transformConfig;

  const { columns } = queryResults[0];

  const selectedColumnOptions =
    dataOrientation === "row"
      ? labelColumn && columns.indexOf(labelColumn) !== -1
        ? queryResults[0].values.map((row) =>
            String(row[columns.indexOf(labelColumn)])
          )
        : []
      : columns;

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
      <>
        Columns to display:
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

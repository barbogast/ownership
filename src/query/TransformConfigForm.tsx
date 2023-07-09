import React from "react";
import { Checkbox, Select } from "antd";

import { QueryExecResult } from "../dbStore";
import { updateTransformConfig, useQuery } from "./queryStore";

type Props = {
  queryId: string;
  queryResults: QueryExecResult[];
};

const TransformConfigForm: React.FC<Props> = ({ queryId, queryResults }) => {
  const { transformConfig } = useQuery(queryId);

  const { dataOrientation, selectedColumns, labelColumn } = transformConfig;

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
        onChange={(dataOrientation) =>
          updateTransformConfig(queryId, { dataOrientation })
        }
        options={[
          { value: "column", label: "Values are in one column" },
          { value: "row", label: "Values are in one row" },
        ]}
        style={{ width: 220 }}
      />
      <br />
      <br />
      <>
        Column containing labels:
        <Select
          value={labelColumn}
          onChange={(labelColumn) => {
            updateTransformConfig(queryId, { labelColumn });
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
            updateTransformConfig(queryId, {
              selectedColumns: values as string[],
            });
          }}
        />
        <br />
      </>
    </>
  );
};

export default TransformConfigForm;

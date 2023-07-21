import React from "react";
import { Checkbox, Select } from "antd";

import { QueryExecResult } from "../databaseConnectionStore";
import { updateTransformConfig, useQuery } from "./queryStore";
import { TransformResult } from "../types";

type Props = {
  queryId: string;
  queryResults: QueryExecResult[];
  transformResult: TransformResult;
};

const TransformConfigForm: React.FC<Props> = ({
  queryId,
  queryResults,
  transformResult,
}) => {
  const { transformConfig } = useQuery(queryId);

  if (!queryResults.length || !transformResult.length) {
    return null;
  }

  const { dataOrientation, selectedColumns, labelColumn } = transformConfig;

  const columns = queryResults[0].columns;

  const selectedColumnOptions = Object.keys(transformResult[0]).filter(
    (col) => col !== labelColumn
  );

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

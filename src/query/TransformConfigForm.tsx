import React from "react";
import { Checkbox, Select } from "antd";

import { QueryExecResult } from "../databaseConnectionStore";
import { Query, updateTransformConfig } from "./queryStore";
import { TransformResult } from "../types";

type Props = {
  query: Query;
  queryResults: QueryExecResult[];
  transformResult: TransformResult;
};

const TransformConfigForm: React.FC<Props> = ({
  query,
  queryResults,
  transformResult,
}) => {
  const { transformConfig } = query;

  const firstQueryResult = queryResults[0];
  const firstTransformResult = transformResult[0];
  if (!firstQueryResult || !firstTransformResult) {
    return null;
  }

  const { dataOrientation, selectedColumns, labelColumn } = transformConfig;

  const columns = firstQueryResult.columns;

  const selectedColumnOptions = Object.keys(firstTransformResult).filter(
    (col) => col !== labelColumn
  );

  return (
    <>
      Orientation of data:{" "}
      <Select
        value={dataOrientation}
        onChange={(dataOrientation) =>
          updateTransformConfig(query.id, { dataOrientation })
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
            updateTransformConfig(query.id, { labelColumn });
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
            updateTransformConfig(query.id, {
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

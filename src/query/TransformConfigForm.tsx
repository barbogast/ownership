import React from "react";
import { Select } from "antd";

import { Query, updateTransformConfig } from "./queryStore";
import { TransformResult } from "../types";

type Props = {
  query: Query;
  transformResult: TransformResult;
};

const TransformConfigForm: React.FC<Props> = ({ query, transformResult }) => {
  const { transformConfig } = query;

  const firstTransformResult = transformResult[0];
  if (!firstTransformResult) {
    return null;
  }

  const { dataOrientation, labelColumn } = transformConfig;

  const columns = Object.keys(firstTransformResult);

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
    </>
  );
};

export default TransformConfigForm;

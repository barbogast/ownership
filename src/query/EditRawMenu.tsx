import { Button, Dropdown } from "antd";
import * as R from "remeda";

import RawJsonEditor from "../components/RawJsonEditor";
import { parseJson, stableStringify } from "../util/json";
import {
  Query,
  replaceQuery,
  updateChartConfig,
  updateQuery,
} from "./queryStore";

type Props = {
  query: Query;
};

const EditRawMenu = ({ query }: Props) => {
  const { id } = query;
  const editRawItems = [
    <RawJsonEditor
      button="Shortened document"
      content={stableStringify(
        R.omit(query, ["transformCode", "sqlStatement"])
      )}
      label={query.label}
      onSubmit={(newContent) => updateQuery(id, parseJson(newContent))}
    />,

    <RawJsonEditor
      button="Full document"
      content={stableStringify(query)}
      label={query.label}
      onSubmit={(newContent) => replaceQuery(id, parseJson(newContent))}
    />,

    <RawJsonEditor
      button="sqlStatement"
      content={query.sqlStatement}
      label={`${query.label}`}
      fileType="sql"
      onSubmit={(newContent) => updateQuery(id, { sqlStatement: newContent })}
    />,

    <RawJsonEditor
      button="transformCode"
      content={query.transformCode}
      label={`${query.label}`}
      fileType="typescript"
      onSubmit={(newContent) => updateQuery(id, { transformCode: newContent })}
    />,

    query.chartConfig?.chartType === "vegaChart" ? (
      <RawJsonEditor
        button="chartConfig.vegaSpec"
        content={query.chartConfig.vegaSpec}
        label={`${query.label}`}
        fileType="json"
        onSubmit={(newContent) =>
          updateChartConfig(id, { vegaSpec: newContent })
        }
      />
    ) : null,
  ];

  return (
    <Dropdown
      menu={{
        items: editRawItems.map((it, i) => ({ key: i, label: it })),
      }}
      placement="bottomLeft"
      arrow
    >
      <Button>Edit raw ...</Button>
    </Dropdown>
  );
};

export default EditRawMenu;

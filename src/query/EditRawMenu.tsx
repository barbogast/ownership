import { Button, Dropdown } from "antd";
import RawJsonEditor from "../components/RawJsonEditor";
import { parseJson, stableStringify } from "../util/json";
import { omit } from "../util/utils";
import { Query, updateQuery } from "./queryStore";

type Props = {
  query: Query;
};

const EditRawMenu = ({ query }: Props) => {
  const { id } = query;
  const editRawItems = [
    <RawJsonEditor
      button="Shortened document"
      content={stableStringify(omit(query, ["transformCode", "sqlStatement"]))}
      label={query.label}
      onSubmit={(newContent) => updateQuery(id, parseJson(newContent))}
    />,

    <RawJsonEditor
      button="Full document"
      content={stableStringify(query)}
      label={query.label}
      onSubmit={(newContent) => updateQuery(id, parseJson(newContent))}
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

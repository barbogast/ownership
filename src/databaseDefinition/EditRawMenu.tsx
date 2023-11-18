import { Button, Dropdown } from "antd";
import RawJsonEditor from "../components/RawJsonEditor";
import { parseJson, stableStringify } from "../util/json";
import { omit } from "../util/utils";
import {
  DatabaseDefinition,
  updateDatabaseDefinition,
} from "./databaseDefinitionStore";

type Props = {
  databaseDefinition: DatabaseDefinition;
};

const EditRawMenu = ({ databaseDefinition }: Props) => {
  const { id } = databaseDefinition;
  const editRawItems = [
    <RawJsonEditor
      button="Shortened document"
      content={stableStringify(
        omit(databaseDefinition, ["jsonContent", "csvContent"])
      )}
      label={databaseDefinition.label}
      onSubmit={(newContent) =>
        updateDatabaseDefinition(id, parseJson(newContent))
      }
    />,

    <RawJsonEditor
      button="Full document"
      content={stableStringify(databaseDefinition)}
      label={databaseDefinition.label}
      onSubmit={(newContent) =>
        updateDatabaseDefinition(id, parseJson(newContent))
      }
    />,

    <RawJsonEditor
      button="jsonContent"
      content={databaseDefinition.jsonContent}
      label={`${databaseDefinition.label}`}
      onSubmit={(newContent) =>
        updateDatabaseDefinition(id, { jsonContent: newContent })
      }
    />,

    <RawJsonEditor
      button="csvContent"
      content={databaseDefinition.csvContent}
      label={`${databaseDefinition.label}`}
      fileType="plaintext"
      onSubmit={(newContent) =>
        updateDatabaseDefinition(id, { csvContent: newContent })
      }
    />,

    <RawJsonEditor
      button="code"
      content={databaseDefinition.code}
      label={`${databaseDefinition.label}`}
      fileType="typescript"
      onSubmit={(newContent) =>
        updateDatabaseDefinition(id, { code: newContent })
      }
    />,

    <RawJsonEditor
      button="postProcessingCode"
      content={databaseDefinition.postProcessingCode}
      label={`${databaseDefinition.label}`}
      fileType="typescript"
      onSubmit={(newContent) =>
        updateDatabaseDefinition(id, { postProcessingCode: newContent })
      }
    />,
  ];

  return (
    <Dropdown
      menu={{
        items: editRawItems.map((it, i) => ({ key: i, label: it })),
      }}
      placement="bottomLeft"
      arrow
      trigger={["click"]}
    >
      <Button>Edit raw ...</Button>
    </Dropdown>
  );
};

export default EditRawMenu;

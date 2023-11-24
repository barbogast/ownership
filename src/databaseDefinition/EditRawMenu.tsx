import { Button, Dropdown } from "antd";
import RawJsonEditor from "../components/RawJsonEditor";
import { parseJson, stableStringify } from "../util/json";
import { omit } from "../util/utils";
import {
  DatabaseDefinition,
  replaceDatabaseDefinition,
  updateDatabaseDefinition,
  updateSourceFileContent,
} from "./databaseDefinitionStore";

type Props = {
  databaseDefinition: DatabaseDefinition;
};

const EditRawMenu = ({ databaseDefinition }: Props) => {
  const { id } = databaseDefinition;
  const editRawItems = [
    {
      key: "1",
      label: (
        <RawJsonEditor
          button="Shortened document"
          content={stableStringify(
            omit(databaseDefinition, [
              "sourceFiles",
              "importCode",
              "postProcessingCode",
            ])
          )}
          label={databaseDefinition.label}
          onSubmit={(newContent) =>
            updateDatabaseDefinition(id, parseJson(newContent))
          }
        />
      ),
    },
    {
      key: "2",
      label: (
        <RawJsonEditor
          button="Full document"
          content={stableStringify(databaseDefinition)}
          label={databaseDefinition.label}
          onSubmit={(newContent) =>
            replaceDatabaseDefinition(id, parseJson(newContent))
          }
        />
      ),
    },
    {
      key: "5",
      label: (
        <RawJsonEditor
          button="code"
          content={databaseDefinition.importCode}
          label={`${databaseDefinition.label}`}
          fileType="typescript"
          onSubmit={(newContent) =>
            updateDatabaseDefinition(id, { importCode: newContent })
          }
        />
      ),
    },
    {
      key: "6",
      label: (
        <RawJsonEditor
          button="postProcessingCode"
          content={databaseDefinition.postProcessingCode}
          label={`${databaseDefinition.label}`}
          fileType="typescript"
          onSubmit={(newContent) =>
            updateDatabaseDefinition(id, { postProcessingCode: newContent })
          }
        />
      ),
    },
    {
      label: "sourceFiles",
      key: "7",
      children: Object.entries(databaseDefinition.sourceFiles).map(
        ([name, content], i) => ({
          key: i,
          label: (
            <RawJsonEditor
              button={name}
              content={content}
              label={`${databaseDefinition.label}`}
              fileType={name.split(".")[1] as "json" | "plaintext"}
              onSubmit={(newContent) =>
                updateSourceFileContent(id, name, newContent)
              }
            />
          ),
        })
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items: editRawItems }}
      placement="bottomLeft"
      arrow
      trigger={["click"]}
    >
      <Button>Edit raw ...</Button>
    </Dropdown>
  );
};

export default EditRawMenu;

import { Alert } from "antd";

import AsyncModal from "./AsyncModal";
import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import useLocalSettingsStore from "../localSettingsStore";

type Props = {
  content: string;
  onSubmit: (newContent: string) => void;
  label: string;
  button: string;
  fileType?: "json" | "plaintext" | "typescript" | "sql";
};

const RawJsonEditor = ({
  content,
  onSubmit,
  label,
  button,
  fileType,
}: Props) => {
  const [newContent, setNewContent] = useState(content);
  const darkModeEnabled = useLocalSettingsStore(
    (state) => state.darkModeEnabled
  );

  return (
    <AsyncModal
      label={`Edit "${label} (${button})"`}
      renderTrigger={(openModal) => <a onClick={openModal}>{button}</a>}
      onSubmit={() => onSubmit(newContent)}
      okText="Save"
      fullscreen
    >
      <div
        style={{
          height: `${window.innerHeight * 0.75}px`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1 }}>
          <Editor
            defaultLanguage={fileType ?? "json"}
            defaultValue={content}
            options={{ automaticLayout: true }}
            onChange={(value) => setNewContent(value as string)}
            theme={darkModeEnabled ? "vs-dark" : undefined}
          />
        </div>

        <br />
        <Alert
          message="Editing raw JSON is dangerous and may break your application or make it corrupt your data. Proceed with caution!"
          type="warning"
        />
        <br />
      </div>
    </AsyncModal>
  );
};

export default RawJsonEditor;

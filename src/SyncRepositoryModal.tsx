import { Alert, Button, Input } from "antd";

import AsyncModal from "./components/AsyncModal";
import { useState } from "react";

type Props = {
  callback: (url: string, user: string, password: string) => Promise<void>;
  label: string;
  buttonLabel: string;
  buttonStyle?: React.CSSProperties;
};
const SyncRepositoryButton: React.FC<Props> = ({
  label,
  buttonLabel,
  callback,
  buttonStyle,
}) => {
  const [url, setUrl] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AsyncModal
      label={label}
      renderTrigger={(openModal) => (
        <Button style={buttonStyle} onClick={openModal}>
          {buttonLabel}
        </Button>
      )}
      onSubmit={async () => {
        // User may append the repository after the username, so it's possible to see which entry
        // to pick in the password manager.
        const [username, _] = user.split("/");
        await callback(url!, username!, password);
        // Reset password, so it doesn't remain in the application state longer than necessary.
        setPassword("");
      }}
      // Reset password, so it doesn't remain in the application state longer than necessary.
      onCancel={() => setPassword("")}
    >
      To create a Github token go to{" "}
      <a href="https://github.com/settings/tokens?type=beta" target="_blank">
        https://github.com/settings/tokens?type=beta
      </a>
      <p>Required settings:</p>
      <ul>
        <li>Repository access: Only select repositories</li>
        <li>Permissions: Contents: Read and write</li>
      </ul>
      <Input
        placeholder="URL"
        addonBefore="URL"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
      />
      <Input
        placeholder="Username"
        addonBefore="Username"
        value={user}
        onChange={(event) => setUser(event.target.value)}
      />
      <Input
        placeholder="Password"
        type="password"
        addonBefore="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <br />
      <br />
      <Alert
        type="info"
        message={`Do you want to use your password manager to store multiple tokens? You can write <username>/<repository> in the "Username" field, which helps to select the correct entry in your password manager.`}
      />
    </AsyncModal>
  );
};

export default SyncRepositoryButton;

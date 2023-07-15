import { Button, Input } from "antd";

import AsyncModal from "./AsyncModal";
import { useState } from "react";
import { RepositoryInfo } from "./types";

type Props = {
  repositoryInfo: RepositoryInfo;
  callback: (
    repositoryInfo: RepositoryInfo,
    user: string,
    password: string
  ) => Promise<void>;
  label: string;
  buttonLabel: string;
  buttonStyle?: React.CSSProperties;
};
const SyncRepositoryButton: React.FC<Props> = ({
  repositoryInfo,
  label,
  buttonLabel,
  callback,
  buttonStyle,
}) => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AsyncModal
      label={label}
      render={(openModal) => (
        <Button style={buttonStyle} onClick={openModal}>
          {buttonLabel}
        </Button>
      )}
      onSubmit={() => callback(repositoryInfo, user, password)}
    >
      <Input
        placeholder="Username"
        addonBefore="Username"
        value={user}
        onChange={(event) => setUser(event.target.value)}
      />
      <Input
        placeholder="Passwort"
        type="password"
        addonBefore="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
    </AsyncModal>
  );
};

export default SyncRepositoryButton;

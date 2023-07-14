import { useState } from "react";
import { Button, Col, Input, Row, Select } from "antd";

import { saveToGit, loadFromGit } from "./util/gitStorage";
import useRepositoryStore from "./repository/repositoryStore";
import { useRepoInfo } from "./util/utils";
import { useLocation } from "wouter";
import AsyncModal from "./AsyncModal";

const RepositoryControl: React.FC = () => {
  const [, setLocation] = useLocation();
  const repositoryInfo = useRepoInfo();
  const projects = useRepositoryStore().repositories;

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  if (!repositoryInfo) {
    return;
  }

  const inputs = (
    <>
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
    </>
  );

  return (
    <>
      <Row wrap={false}>
        <Col>
          <Button onClick={() => setLocation("/")} type="text">
            ←
          </Button>
        </Col>
        <Col flex={1}>
          <Select
            options={Object.values(projects).map((project) => ({
              title: `${project.organization}/${project.repository}`,
              value: `${project.organization}/${project.repository}`,
            }))}
            value={repositoryInfo.path}
            style={{ width: "100%" }}
            onSelect={(value) => setLocation("/" + value)}
          />
        </Col>
      </Row>

      <Row justify="space-between" style={{ marginTop: 10 }}>
        <AsyncModal
          label="Loading repository"
          render={(openModal) => <Button onClick={openModal}>Load ...</Button>}
          onSubmit={() => loadFromGit(repositoryInfo, user, password)}
        >
          Only necessary for private repositories.
          {inputs}
        </AsyncModal>

        <AsyncModal
          label="Saving repository"
          render={(openModal) => <Button onClick={openModal}>Save ...</Button>}
          onSubmit={() => saveToGit(repositoryInfo.path, user, password)}
        >
          {inputs}
        </AsyncModal>
      </Row>
    </>
  );
};

export default RepositoryControl;

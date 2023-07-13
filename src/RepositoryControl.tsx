import { useState } from "react";
import { Button, Col, Row, Select } from "antd";

import { saveToGit, loadFromGit } from "./util/gitStorage";
import useModifiedStore from "./modifiedStore";
import useRepositoryStore from "./repository/repositoryStore";
import { useRepoInfo } from "./util/utils";
import { useLocation } from "wouter";

const RepositoryControl: React.FC = () => {
  const [, setLocation] = useLocation();
  const repositoryInfo = useRepoInfo();
  const projects = useRepositoryStore().repositories;
  const [isSaving, setIsSaving] = useState(false);

  if (!repositoryInfo) {
    return;
  }

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
        <Button
          loading={isSaving}
          onClick={async () => {
            setIsSaving(true);
            await saveToGit(repositoryInfo.path);
            useModifiedStore.setState(() => ({ modifiedQueries: [] }));
            setIsSaving(false);
          }}
        >
          Save
        </Button>
        <Button
          onClick={() => loadFromGit(repositoryInfo).catch(console.error)}
        >
          Load
        </Button>
      </Row>
    </>
  );
};

export default RepositoryControl;

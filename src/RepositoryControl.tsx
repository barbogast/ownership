import { Button, Col, Row, Select } from "antd";

import { saveToGit, loadFromGit } from "./util/gitStorage";
import useRepositoryStore from "./repository/repositoryStore";
import { useRepoInfo } from "./util/utils";
import { useLocation } from "wouter";
import SyncRepositoryButton from "./SyncRepositoryButton";

const RepositoryControl: React.FC = () => {
  const [, setLocation] = useLocation();
  const repositoryInfo = useRepoInfo();
  const projects = useRepositoryStore().repositories;

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
        <SyncRepositoryButton
          buttonLabel="Load ..."
          label="Loading repository"
          callback={loadFromGit}
          repositoryInfo={repositoryInfo}
        />
        <SyncRepositoryButton
          buttonLabel="Save ..."
          label="Saving repository"
          callback={saveToGit}
          repositoryInfo={repositoryInfo}
        />
      </Row>
    </>
  );
};

export default RepositoryControl;

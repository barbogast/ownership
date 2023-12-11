import { Button, Col, Row, Select } from "antd";

import { saveToGit, loadFromGit, getHelpersBrowser } from "./util/gitStorage";
import useRepositoryStore from "./repository/repositoryStore";
import { useRepoInfo } from "./util/utils";
import { useLocation } from "wouter";
import SyncRepositoryModal from "./SyncRepositoryModal";
import { reset } from "./modifiedStore";

const RepositoryControl: React.FC = () => {
  const [, setLocation] = useLocation();
  const repositoryInfo = useRepoInfo();
  const projects = useRepositoryStore().repositories;

  if (!repositoryInfo) {
    return;
  }

  return (
    <div style={{ marginLeft: 10 }}>
      <Row wrap={false}>
        <Col>
          <Button onClick={() => setLocation("/")} type="text">
            ←
          </Button>
        </Col>
        <Col flex={1}>
          <Select
            data-testid="repository-select"
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
        <SyncRepositoryModal
          buttonLabel="Load ..."
          label="Loading repository"
          callback={(info, user, pw) =>
            loadFromGit(getHelpersBrowser(info), info, user, pw)
          }
          repositoryInfo={repositoryInfo}
        />
        <SyncRepositoryModal
          buttonLabel="Save ..."
          label="Saving repository"
          callback={async (info, user, pw) => {
            await saveToGit(getHelpersBrowser(info), info, user, pw);
            reset();
          }}
          repositoryInfo={repositoryInfo}
        />
      </Row>
    </div>
  );
};

export default RepositoryControl;

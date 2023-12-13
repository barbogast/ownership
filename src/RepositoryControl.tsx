import { Button, Col, Row, Select } from "antd";

import { loadFromGit, getHelpersBrowser, saveToGit } from "./util/gitStorage";
import useRepositoryStore, {
  useRepositoryFromUrl,
} from "./repository/repositoryStore";
import { useRepoInfo } from "./util/utils";
import { useLocation } from "wouter";
import SyncRepositoryModal from "./SyncRepositoryModal";
import { reset } from "./modifiedStore";
import {
  exportStoresToFolder,
  importStoresFromFolder,
} from "./nestedStores/stores";

const RepositoryControl: React.FC = () => {
  const [, setLocation] = useLocation();
  const repositoryInfo = useRepoInfo();
  const repository = useRepositoryFromUrl()!;
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
          callback={async (info, username, password) => {
            const folder = await loadFromGit(
              getHelpersBrowser(info, { username, password }),
              "https://github.com/" + info.path
            );
            await importStoresFromFolder(repository, folder);
          }}
          repositoryInfo={repositoryInfo}
        />
        <SyncRepositoryModal
          buttonLabel="Save ..."
          label="Saving repository"
          callback={async (info, username, password) => {
            await saveToGit(
              getHelpersBrowser(info, { username, password }),
              "https://github.com/" + info.path,
              exportStoresToFolder()
            );
            reset();
          }}
          repositoryInfo={repositoryInfo}
        />
      </Row>
    </div>
  );
};

export default RepositoryControl;

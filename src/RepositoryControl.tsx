import { Button, Col, Row, Select } from "antd";

import { loadFromGit, getHelpersBrowser, saveToGit } from "./util/gitStorage";
import useRepositoryStore, {
  useRepositoryFromUrl,
} from "./repository/repositoryStore";
import { useLocation } from "wouter";
import SyncRepositoryModal from "./SyncRepositoryModal";
import { reset } from "./modifiedStore";
import {
  exportStoresToFolder,
  importStoresFromFolder,
} from "./nestedStores/stores";

const RepositoryControl: React.FC = () => {
  const [, setLocation] = useLocation();
  const repository = useRepositoryFromUrl()!;
  const projects = useRepositoryStore().repositories;

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
              title: project.name,
              value: project.name,
            }))}
            value={repository.name}
            style={{ width: "100%" }}
            onSelect={(value) => setLocation("/" + value)}
          />
        </Col>
      </Row>

      <Row justify="space-between" style={{ marginTop: 10 }}>
        <SyncRepositoryModal
          buttonLabel="Load ..."
          label="Loading repository"
          callback={async (url, username, password) => {
            const folder = await loadFromGit(
              getHelpersBrowser(repository.id, { username, password }),
              url
            );
            await importStoresFromFolder(repository, folder);
          }}
        />
        <SyncRepositoryModal
          buttonLabel="Save ..."
          label="Saving repository"
          callback={async (url, username, password) => {
            await saveToGit(
              getHelpersBrowser(repository.id, { username, password }),
              url,
              exportStoresToFolder()
            );
            reset();
          }}
        />
      </Row>
    </div>
  );
};

export default RepositoryControl;

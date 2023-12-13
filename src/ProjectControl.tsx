import { Button, Col, Row, Select } from "antd";

import { loadFromGit, getHelpersBrowser, saveToGit } from "./util/gitStorage";
import useProjectStore, { useProjectFromUrl } from "./project/projectStore";
import { useLocation } from "wouter";
import SyncRepositoryModal from "./SyncRepositoryModal";
import { reset } from "./modifiedStore";
import {
  exportStoresToFolder,
  importStoresFromFolder,
} from "./nestedStores/stores";

const ProjectControl: React.FC = () => {
  const [, setLocation] = useLocation();
  const project = useProjectFromUrl()!;
  const projects = useProjectStore();

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
            data-testid="project-select"
            options={Object.values(projects).map((project) => ({
              title: project.name,
              value: project.name,
            }))}
            value={project.name}
            style={{ width: "100%" }}
            onSelect={(value) => setLocation("/" + value)}
          />
        </Col>
      </Row>

      <Row justify="space-between" style={{ marginTop: 10 }}>
        <SyncRepositoryModal
          buttonLabel="Load ..."
          label="Import from repository"
          callback={async (url, username, password) => {
            const folder = await loadFromGit(
              getHelpersBrowser(project.id, { username, password }),
              url
            );
            await importStoresFromFolder(project, folder);
          }}
        />
        <SyncRepositoryModal
          buttonLabel="Save ..."
          label="Export to repository"
          callback={async (url, username, password) => {
            await saveToGit(
              getHelpersBrowser(project.id, { username, password }),
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

export default ProjectControl;

import { Button, Col, Input, Popconfirm, Row } from "antd";
import { Fragment, useState } from "react";
import useProjectStore, {
  addProject,
  deleteProject,
  updateProject,
} from "./repositoryStore";
import { Link } from "wouter";
import stores from "../nestedStores/stores";

const LEFT_COLUMNS = 8;
const RIGHT_COLUMN = 3;
const BUTTON_STYLE = { width: 75 };

const ProjectList: React.FC = () => {
  const projects = useProjectStore().projects;
  const initialNewProjectState = { name: "" };
  const [newProject, setNewProject] = useState(initialNewProjectState);

  const initialEditProjectState = {
    id: "",
    name: "",
  };
  const [editProject, setEditProject] = useState(initialEditProjectState);

  return (
    <Row gutter={[16, 16]} style={{ width: 700 }}>
      {Object.values(projects).map((project, i) => (
        <Fragment key={i}>
          {editProject.id === project.id ? (
            <>
              <Col span={LEFT_COLUMNS}>
                <Input
                  value={editProject.name}
                  onChange={(event) =>
                    setEditProject((state) => ({
                      ...state,
                      name: event.target.value,
                    }))
                  }
                />
              </Col>
              <Col span={RIGHT_COLUMN}>
                <Button
                  onClick={() => {
                    updateProject(editProject.id, editProject);
                    setEditProject(initialEditProjectState);
                  }}
                  style={BUTTON_STYLE}
                >
                  Save
                </Button>
              </Col>
              <Col span={RIGHT_COLUMN}>
                <Button
                  onClick={() => setEditProject(initialEditProjectState)}
                  style={BUTTON_STYLE}
                >
                  Cancel
                </Button>
              </Col>
              <Col span={RIGHT_COLUMN}></Col>
            </>
          ) : (
            <>
              <Col span={LEFT_COLUMNS}>{project.name}</Col>
              <Col span={RIGHT_COLUMN}>
                <Link href={`/${project.name}`}>
                  <Button type="primary" style={BUTTON_STYLE} role="button">
                    Open
                  </Button>
                </Link>
              </Col>
              <Col span={RIGHT_COLUMN}>
                <Button
                  onClick={() => {
                    setEditProject({ ...project });
                  }}
                  style={BUTTON_STYLE}
                >
                  Edit
                </Button>
              </Col>
              <Col span={RIGHT_COLUMN}>
                <Popconfirm
                  title="Delete the project?"
                  onConfirm={async () => {
                    deleteProject(project.id);
                    for (const store of stores) {
                      await store.delete(project.id);
                    }
                  }}
                >
                  <Button danger style={BUTTON_STYLE}>
                    Delete
                  </Button>
                </Popconfirm>
              </Col>
            </>
          )}
        </Fragment>
      ))}
      <>
        <Col span={LEFT_COLUMNS}>
          <Input
            placeholder="Name"
            value={newProject.name}
            onChange={(event) =>
              setNewProject((state) => ({
                ...state,
                name: event.target.value,
              }))
            }
          />
        </Col>
        <Col span={RIGHT_COLUMN}>
          <Button
            onClick={() => {
              addProject(newProject.name);
              setNewProject(initialNewProjectState);
            }}
            style={BUTTON_STYLE}
          >
            Create
          </Button>
        </Col>
      </>
    </Row>
  );
};

export default ProjectList;

import { Button, Col, Input, Row } from "antd";
import { useState } from "react";
import useProjectStore, { addProject, updateProject } from "./projectStore";
import { Link } from "wouter";

const Projects: React.FC = () => {
  const projects = useProjectStore().projects;

  const initialNewProjectState = { organization: "", repository: "" };
  const [newProject, setNewProject] = useState(initialNewProjectState);

  const initialEditProjectState = {
    organization: "",
    repository: "",
    id: "",
  };
  const [editProject, setEditProject] = useState(initialEditProjectState);

  return (
    <>
      {Object.values(projects).map((project) => (
        <Row gutter={[24, 24]} key={project.id}>
          {editProject.id === project.id ? (
            <>
              <Col span={3}>
                <div>
                  <Input
                    value={editProject.organization}
                    onChange={(event) =>
                      setEditProject((state) => ({
                        ...state,
                        organization: event.target.value,
                      }))
                    }
                  />
                </div>
              </Col>
              <Col span={3}>
                <div>
                  <Input
                    value={editProject.repository}
                    onChange={(event) =>
                      setEditProject((state) => ({
                        ...state,
                        repository: event.target.value,
                      }))
                    }
                  />
                </div>
              </Col>
              <Col span={3}>
                <div>
                  <Button
                    onClick={() => {
                      updateProject(editProject.id, editProject);
                      setEditProject(initialEditProjectState);
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditProject(initialEditProjectState)}
                  >
                    Cancel
                  </Button>
                </div>
              </Col>
            </>
          ) : (
            <>
              <Col span={3}>{project.organization}</Col>
              <Col span={3}>{project.repository}</Col>
              <Col span={3} style={{ display: "flex" }}>
                <Link href={`/${project.organization}/${project.repository}`}>
                  <Button type="primary">Open</Button>
                </Link>
                <Button
                  onClick={() => {
                    setEditProject({
                      id: project.id,
                      organization: project.organization,
                      repository: project.repository,
                    });
                  }}
                >
                  Edit
                </Button>
              </Col>
            </>
          )}
        </Row>
      ))}
      <Row gutter={[16, 16]}>
        <Col span={3}>
          <Input
            placeholder="Organization"
            value={newProject.organization}
            onChange={(event) =>
              setNewProject((state) => ({
                ...state,
                organization: event.target.value,
              }))
            }
          />
        </Col>
        <Col span={3}>
          <Input
            placeholder="Repository"
            value={newProject.repository}
            onChange={(event) =>
              setNewProject((state) => ({
                ...state,
                repository: event.target.value,
              }))
            }
          />
        </Col>
        <Col span={3}>
          <Button
            onClick={() => {
              addProject(newProject.organization, newProject.repository);
              setNewProject(initialNewProjectState);
            }}
          >
            Create
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Projects;
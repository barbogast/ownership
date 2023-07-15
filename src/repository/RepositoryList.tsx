import { Button, Col, Input, Popconfirm, Row } from "antd";
import { useState } from "react";
import useRepositoryStore, {
  addRepository,
  deleteRepository,
  updateRepository,
} from "./repositoryStore";
import { Link } from "wouter";
import { loadFromGit } from "../util/gitStorage";
import { getRepoInfo } from "../util/utils";
import SyncRepositoryButton from "../SyncRepositoryButton";

const RepositoryList: React.FC = () => {
  const repositories = useRepositoryStore().repositories;
  const initialNewRepoState = { organization: "", repository: "" };
  const [newRepo, setNewRepo] = useState(initialNewRepoState);

  const initialEditRepoState = {
    organization: "",
    repository: "",
    id: "",
  };
  const [editRepo, setEditRepo] = useState(initialEditRepoState);

  return (
    <>
      {Object.values(repositories).map((repo) => (
        <Row gutter={[24, 24]} key={repo.id}>
          {editRepo.id === repo.id ? (
            <>
              <Col span={3}>
                <Input
                  value={editRepo.organization}
                  onChange={(event) =>
                    setEditRepo((state) => ({
                      ...state,
                      organization: event.target.value,
                    }))
                  }
                />
              </Col>
              <Col span={3}>
                <Input
                  value={editRepo.repository}
                  onChange={(event) =>
                    setEditRepo((state) => ({
                      ...state,
                      repository: event.target.value,
                    }))
                  }
                />
              </Col>
              <Col span={3}>
                <Button
                  onClick={() => {
                    updateRepository(editRepo.id, editRepo);
                    setEditRepo(initialEditRepoState);
                  }}
                >
                  Save
                </Button>
                <Button onClick={() => setEditRepo(initialEditRepoState)}>
                  Cancel
                </Button>
              </Col>
            </>
          ) : (
            <>
              <Col span={3}>{repo.organization}</Col>
              <Col span={3}>{repo.repository}</Col>
              <Col span={3} style={{ display: "flex" }}>
                <Link href={`/${repo.organization}/${repo.repository}`}>
                  <Button type="primary">Open</Button>
                </Link>
                <Button
                  onClick={() => {
                    setEditRepo({
                      id: repo.id,
                      organization: repo.organization,
                      repository: repo.repository,
                    });
                  }}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete the repository?"
                  onConfirm={() => deleteRepository(repo.id)}
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              </Col>
            </>
          )}
        </Row>
      ))}
      <Row gutter={[16, 16]}>
        <Col span={3}>
          <Input
            placeholder="Organization"
            value={newRepo.organization}
            onChange={(event) =>
              setNewRepo((state) => ({
                ...state,
                organization: event.target.value,
              }))
            }
          />
        </Col>
        <Col span={3}>
          <Input
            placeholder="Repository"
            value={newRepo.repository}
            onChange={(event) =>
              setNewRepo((state) => ({
                ...state,
                repository: event.target.value,
              }))
            }
          />
        </Col>
        <Col span={6}>
          <Button
            onClick={() => {
              addRepository(
                getRepoInfo(newRepo.organization, newRepo.repository)
              );
              setNewRepo(initialNewRepoState);
            }}
          >
            Create
          </Button>
          <SyncRepositoryButton
            buttonLabel="Import from Github"
            label="Importing from Github"
            callback={async (repositoryInfo, username, password) => {
              await loadFromGit(repositoryInfo, username, password);
              addRepository(repositoryInfo);
              setNewRepo(initialNewRepoState);
            }}
            repositoryInfo={getRepoInfo(
              newRepo.organization,
              newRepo.repository
            )}
          />
        </Col>
      </Row>
    </>
  );
};

export default RepositoryList;

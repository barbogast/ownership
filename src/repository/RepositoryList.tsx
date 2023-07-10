import { Button, Col, Input, Row } from "antd";
import { useState } from "react";
import useRepositoryStore, {
  addRepository,
  updateRepository,
} from "./repositoryStore";
import { Link } from "wouter";
import { loadFromGit } from "../util/gitStorage";
import { getRepoInfo } from "../util/utils";
import { importStore } from "../query/queryStore";

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

  const [isImporting, setIsImporting] = useState(false);

  return (
    <>
      {Object.values(repositories).map((repo) => (
        <Row gutter={[24, 24]} key={repo.id}>
          {editRepo.id === repo.id ? (
            <>
              <Col span={3}>
                <div>
                  <Input
                    value={editRepo.organization}
                    onChange={(event) =>
                      setEditRepo((state) => ({
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
                    value={editRepo.repository}
                    onChange={(event) =>
                      setEditRepo((state) => ({
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
                      updateRepository(editRepo.id, editRepo);
                      setEditRepo(initialEditRepoState);
                    }}
                  >
                    Save
                  </Button>
                  <Button onClick={() => setEditRepo(initialEditRepoState)}>
                    Cancel
                  </Button>
                </div>
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
        <Col span={3}>
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
          <Button
            loading={isImporting}
            onClick={async () => {
              setIsImporting(true);
              const info = getRepoInfo(
                newRepo.organization,
                newRepo.repository
              );
              const queries = await loadFromGit(info.path);
              importStore(info, queries);
              addRepository(info);
              setNewRepo(initialNewRepoState);
              setIsImporting(false);
            }}
          >
            Import from Github
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default RepositoryList;

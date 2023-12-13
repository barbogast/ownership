import { Button, Col, Input, Popconfirm, Row } from "antd";
import { Fragment, useState } from "react";
import useRepositoryStore, {
  addRepository,
  deleteRepository,
  updateRepository,
} from "./repositoryStore";
import { Link } from "wouter";
import stores from "../nestedStores/stores";

const LEFT_COLUMNS = 8;
const RIGHT_COLUMN = 3;
const BUTTON_STYLE = { width: 75 };

const RepositoryList: React.FC = () => {
  const repositories = useRepositoryStore().repositories;
  const initialNewRepoState = { name: "" };
  const [newRepo, setNewRepo] = useState(initialNewRepoState);

  const initialEditRepoState = {
    id: "",
    name: "",
  };
  const [editRepo, setEditRepo] = useState(initialEditRepoState);

  return (
    <Row gutter={[16, 16]} style={{ width: 700 }}>
      {Object.values(repositories).map((repo, i) => (
        <Fragment key={i}>
          {editRepo.id === repo.id ? (
            <>
              <Col span={LEFT_COLUMNS}>
                <Input
                  value={editRepo.name}
                  onChange={(event) =>
                    setEditRepo((state) => ({
                      ...state,
                      name: event.target.value,
                    }))
                  }
                />
              </Col>
              <Col span={RIGHT_COLUMN}>
                <Button
                  onClick={() => {
                    updateRepository(editRepo.id, editRepo);
                    setEditRepo(initialEditRepoState);
                  }}
                  style={BUTTON_STYLE}
                >
                  Save
                </Button>
              </Col>
              <Col span={RIGHT_COLUMN}>
                <Button
                  onClick={() => setEditRepo(initialEditRepoState)}
                  style={BUTTON_STYLE}
                >
                  Cancel
                </Button>
              </Col>
              <Col span={RIGHT_COLUMN}></Col>
            </>
          ) : (
            <>
              <Col span={LEFT_COLUMNS}>{repo.name}</Col>
              <Col span={RIGHT_COLUMN}>
                <Link href={`/${repo.name}`}>
                  <Button type="primary" style={BUTTON_STYLE} role="button">
                    Open
                  </Button>
                </Link>
              </Col>
              <Col span={RIGHT_COLUMN}>
                <Button
                  onClick={() => {
                    setEditRepo({ ...repo });
                  }}
                  style={BUTTON_STYLE}
                >
                  Edit
                </Button>
              </Col>
              <Col span={RIGHT_COLUMN}>
                <Popconfirm
                  title="Delete the repository?"
                  onConfirm={async () => {
                    deleteRepository(repo.id);
                    for (const store of stores) {
                      await store.delete(repo.id);
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
            value={newRepo.name}
            onChange={(event) =>
              setNewRepo((state) => ({
                ...state,
                name: event.target.value,
              }))
            }
          />
        </Col>
        <Col span={RIGHT_COLUMN}>
          <Button
            onClick={() => {
              addRepository(newRepo.name);
              setNewRepo(initialNewRepoState);
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

export default RepositoryList;

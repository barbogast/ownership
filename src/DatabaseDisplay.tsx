import React, { Fragment, useEffect, useState } from "react";

import {
  QueryExecResult,
  useDatabaseConnection,
} from "./databaseConnectionStore";
import TableDisplay from "./display/TableDisplay";
import { rowsToObjects } from "./util/transform";
import { initialize } from "./util/database";
import useDatabaseDefinitionStore, {
  duplicateDatabaseDefinition,
  deleteDatabaseDefinition,
  updateDatabaseDefinition,
} from "./databaseDefinitionStore";
import { Alert, Button, Col, Input, Row } from "antd";
import getSteps from "./createDatabaseWizard";
import WizardModal from "./wizard/WizardModal";
import AsyncModal from "./AsyncModal";
import { useQueriesByDatabase } from "./query/queryStore";
import { Link, useLocation } from "wouter";

type Props2 = {
  id: string;
};

const DeleteDatabaseDefinitionModal: React.FC<Props2> = ({ id }) => {
  const queries = useQueriesByDatabase(id);
  return (
    <>
      {queries.length > 0 ? (
        <>
          This database is used by the following queries:
          <ul>
            {queries.map((query) => (
              <li>
                <Link href={`/query/${query.id}`}>{query.label}</Link>
              </li>
            ))}
          </ul>
          Are you sure you still want to delete this database?
        </>
      ) : (
        <>This database is not used by any queries, it can safely be deleted.</>
      )}
      <br />
      <br />
      <Alert message="This action cannot be undone." type="warning" showIcon />
    </>
  );
};

type Props = {
  params: {
    name: string;
  };
};

const DiplayDatabase: React.FC<Props> = ({ params }) => {
  const conn = useDatabaseConnection(params.name);
  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const databaseDefintion = useDatabaseDefinitionStore()[params.name];
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (conn.status === "uninitialized") {
      initialize({ type: "local", url: params.name }, databaseDefintion);
      return;
    }

    if (conn.status === "loading" || conn.status === "error") {
      return;
    }

    const tables = conn.db
      .exec(`SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name`)
      .map((row) => row.values[0] as unknown as string);

    setTables(tables);

    const query = tables.map((table) => `select * from ${table}`).join(";\n");

    const result = conn.db.exec(query);
    setQueryResults(result);
  }, [conn, params.name, databaseDefintion]);

  return (
    <div style={{ display: "block", flexDirection: "column" }}>
      <Row>
        <Col span={12}>
          <Input
            addonBefore="Label"
            value={databaseDefintion.name}
            onChange={(event) =>
              updateDatabaseDefinition(params.name, {
                name: event.target.value,
              })
            }
            style={{ width: 500 }}
          />
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <WizardModal
            steps={getSteps(true)}
            initialResult={{ ...databaseDefintion, parsedCsvContent: [] }}
            render={(openModal) => <Button onClick={openModal}>Edit</Button>}
          />{" "}
          <Button onClick={() => duplicateDatabaseDefinition(params.name)}>
            Duplicate
          </Button>{" "}
          <AsyncModal
            label={`Are you sure you want to delete the database "${params.name}"?`}
            render={(openModal) => (
              <Button onClick={openModal}>Delete...</Button>
            )}
            onSubmit={() => {
              deleteDatabaseDefinition(params.name);
              setLocation("/");
            }}
          >
            <DeleteDatabaseDefinitionModal id={params.name} />
          </AsyncModal>
        </Col>
      </Row>

      {conn.status === "loaded" &&
        queryResults.map((queryResult, i) => (
          <Fragment key={i}>
            <h2>{tables[i]}</h2>
            <TableDisplay transformResult={rowsToObjects(queryResult)} />
          </Fragment>
        ))}

      {conn.status === "error" && (
        <Alert message={conn.error.message} type="error" />
      )}
    </div>
  );
};

export default DiplayDatabase;

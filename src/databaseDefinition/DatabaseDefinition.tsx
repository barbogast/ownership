import React, { Fragment, useEffect, useState } from "react";
import * as R from "remeda";

import {
  QueryExecResult,
  useDatabaseConnection,
} from "../databaseConnectionStore";
import TableDisplay from "../display/TableDisplay";
import { rowsToObjects } from "../util/transform";
import { initialize } from "../util/database";
import {
  duplicateDatabaseDefinition,
  deleteDatabaseDefinition,
  updateDatabaseDefinition,
  DatabaseDefinition,
} from "./databaseDefinitionStore";
import { Alert, Button, Col, Input, Row, Spin, Typography } from "antd";
import getConfig from "../createDatabaseWizard";
import WizardModal from "../components/wizard/WizardModal";
import AsyncModal from "../components/AsyncModal";
import { useQueriesByDatabase } from "../query/queryStore";
import { Link, useLocation } from "wouter";
import { sourceToStepMapping } from "../createDatabaseWizard/utils";
import EditRawMenu from "./EditRawMenu";

const { Title } = Typography;

const DeleteDatabaseDefinitionModal: React.FC<{
  id: string;
}> = ({ id }) => {
  const queries = useQueriesByDatabase(id);
  return (
    <>
      {queries.length > 0 ? (
        <>
          This database is used by the following queries:
          <ul>
            {queries.map((query, i) => (
              <li key={i}>
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
  databaseDefinition: DatabaseDefinition;
};

const DatabaseDefinition: React.FC<Props> = ({ databaseDefinition }) => {
  const id = databaseDefinition.id;
  const conn = useDatabaseConnection(id);
  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  const [tables, setTables] = useState<string[]>([]);

  const [, setLocation] = useLocation();

  useEffect(() => {
    if (conn.status === "uninitialized") {
      initialize({ type: "local", id }, databaseDefinition).catch(
        console.error
      );
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
  }, [conn, id, databaseDefinition]);

  return (
    <div style={{ display: "block", flexDirection: "column", height: "100%" }}>
      <Row>
        <Col span={12}>
          <Input
            addonBefore="Label"
            value={databaseDefinition.label}
            onChange={(event) =>
              updateDatabaseDefinition(id, {
                label: event.target.value,
              })
            }
            style={{ width: 500 }}
          />
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <WizardModal
            title="Edit Database"
            config={getConfig(true)}
            initialResult={{
              ...R.clone(databaseDefinition),
              json: {},
              csv: {},
            }}
            initialStepName={sourceToStepMapping[databaseDefinition.source]}
            renderTrigger={(openModal) => (
              <Button onClick={openModal}>Edit</Button>
            )}
          />{" "}
          <Button onClick={() => duplicateDatabaseDefinition(id)}>
            Duplicate
          </Button>{" "}
          <AsyncModal
            label={`Are you sure you want to delete the database "${databaseDefinition.label}"?`}
            renderTrigger={(openModal) => (
              <Button onClick={openModal}>Delete...</Button>
            )}
            onSubmit={() => {
              deleteDatabaseDefinition(id);
              setLocation("/");
            }}
          >
            <DeleteDatabaseDefinitionModal id={id} />
          </AsyncModal>
          <EditRawMenu databaseDefinition={databaseDefinition} />
        </Col>
      </Row>
      {conn.status === "loading" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Spin size="large" />
        </div>
      )}
      {conn.status === "loaded" &&
        queryResults.map((queryResult, i) => (
          <Fragment key={i}>
            <Title level={3}>{tables[i]}</Title>
            <TableDisplay transformResult={rowsToObjects(queryResult)} />
          </Fragment>
        ))}

      {conn.status === "error" && (
        <Alert message={conn.error.message} type="error" />
      )}
    </div>
  );
};

export default DatabaseDefinition;

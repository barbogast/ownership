import React, { useEffect, useState } from "react";

import {
  QueryExecResult,
  useDatabaseConnection,
} from "./databaseConnectionStore";
import TableDisplay from "./display/TableDisplay";
import { rowsToObjects } from "./util/transform";
import { initialize } from "./util/database";
import useDatabaseDefinitionStore from "./databaseDefinitionStore";
import { Button } from "antd";
import getSteps from "./createDatabaseWizard";
import WizardModal from "./wizard/WizardModal";

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
      <WizardModal
        steps={getSteps(true)}
        initialResult={databaseDefintion}
        render={(openModal) => <Button onClick={openModal}>Edit</Button>}
      />
      {queryResults.map((queryResult, i) => (
        <>
          <h2>{tables[i]}</h2>
          <TableDisplay transformResult={rowsToObjects(queryResult)} key={i} />
        </>
      ))}
    </div>
  );
};

export default DiplayDatabase;

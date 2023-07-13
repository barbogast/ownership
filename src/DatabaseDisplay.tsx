import React, { useEffect, useState } from "react";

import {
  QueryExecResult,
  useDatabaseConnection,
} from "./databaseConnectionStore";
import TableDisplay from "./display/TableDisplay";
import { rowsToObjects } from "./util/transform";
import { initialize } from "./util/database";
import useDatabaseDefinitionStore from "./databaseDefinitionStore";

type Props = {
  params: {
    name: string;
  };
};

const DiplayDatabase: React.FC<Props> = ({ params }) => {
  const conn = useDatabaseConnection(params.name);
  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  const databaseDefintion = useDatabaseDefinitionStore()[params.name];

  useEffect(() => {
    if (conn.status === "uninitialized") {
      initialize(
        { type: "local", url: params.name },
        databaseDefintion.csvContent
      );
      return;
    }

    if (conn.status === "loading" || conn.status === "error") {
      return;
    }

    const tables = conn.db
      .exec(`SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name`)
      .map((row) => row.values[0]);

    const query = tables.map((table) => `select * from ${table}`).join(";\n");

    const result = conn.db.exec(query);
    setQueryResults(result);
  }, [conn, params.name, databaseDefintion]);

  return (
    <div style={{ display: "block", flexDirection: "column" }}>
      {queryResults.map((queryResult, i) => (
        <TableDisplay transformResult={rowsToObjects(queryResult)} key={i} />
      ))}
    </div>
  );
};

export default DiplayDatabase;

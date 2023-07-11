import React, { useEffect, useState } from "react";

import { QueryExecResult } from "./databaseConnectionStore";
import TableDisplay from "./display/TableDisplay";
import { rowsToObjects } from "./util/transform";
import useDb from "./useDb";

type Props = {
  params: {
    name: string;
  };
};

const DiplayDatabase: React.FC<Props> = ({ params }) => {
  const db = useDb({ url: params.name, type: "local" });

  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);

  useEffect(() => {
    const func = async () => {
      if (db.status === "loaded") {
        const tables = db.db
          .exec(
            `SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name`
          )
          .map((row) => row.values[0]);

        const query = tables
          .map((table) => `select * from ${table}`)
          .join(";\n");

        const result = db.db.exec(query);
        setQueryResults(result);
      }
    };

    func();
  }, [db]);

  return (
    <div style={{ display: "block", flexDirection: "column" }}>
      {queryResults.map((queryResult, i) => (
        <TableDisplay transformResult={rowsToObjects(queryResult)} key={i} />
      ))}
    </div>
  );
};

export default DiplayDatabase;

import React, { useEffect, useState } from "react";
import { useDatabase, QueryExecResult } from "./dbStore";
import TableDisplay from "./display/TableDisplay";
import { queryExecResultToObjects } from "./query/utils";

type Props = {
  params: {
    fileName: string;
  };
};

const DiplayDatabase: React.FC<Props> = ({ params }) => {
  const db = useDatabase(params.fileName, true);

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
        <TableDisplay
          transformResult={queryExecResultToObjects(queryResult)}
          key={i}
        />
      ))}
    </div>
  );
};

export default DiplayDatabase;

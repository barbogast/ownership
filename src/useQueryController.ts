import { useEffect, useState } from "react";
import { QueryExecResult } from "sql.js";

import { Query } from "./query/queryStore";
import { flipArrayOfObjects, rowsToObjects } from "./util/transform";
import { TransformResult } from "./types";
import { initialize } from "./util/database";
import useDatabaseDefinitionStore from "./databaseDefinition/databaseDefinitionStore";
import {
  DatabaseConnection,
  useDatabaseConnection,
} from "./databaseConnectionStore";
import { ExecutionError } from "./codeExecution/types";
import { execute } from "./codeExecution/transformQuery";

type Progress = {
  queried?: boolean;
  transformed?: boolean;
};

export type QueryState =
  | {
      state: "ready" | "dbInitializing" | "dbQueryRunning" | "transformRunning";
    }
  | { state: "dbInitError"; errorMessage: string }
  | { state: "dbQueryError"; errorMessage: string }
  | {
      state: "transformError";
      error: ExecutionError;
    };

const getStateFromDbState = (db: DatabaseConnection): QueryState => {
  switch (db.status) {
    case "uninitialized":
    case "loading":
      return { state: "dbInitializing" };
    case "error":
      return { state: "dbInitError", errorMessage: db.error.message };
    case "loaded":
      return { state: "ready" };
  }
};

const useQueryController = (query: Query) => {
  const [progress, setProgress] = useState<Progress>({});

  if (query.databaseSource.type !== "local") {
    throw new Error(
      `databaseSource.type "${query.databaseSource.type}" not supported}`
    );
  }
  const db = useDatabaseConnection(query.databaseSource.id);
  const databaseDefintion =
    useDatabaseDefinitionStore()[query.databaseSource.id];

  const [queryResults, setQueryResults] = useState<TransformResult[]>([]);
  const [transformResult, setTransformResult] = useState<TransformResult>([]);

  const [queryState, setQueryState] = useState<QueryState>(
    getStateFromDbState(db)
  );

  const runQuery = (
    db: DatabaseConnection,
    statement: string
  ): QueryExecResult[] => {
    if (db.status !== "loaded")
      throw new Error(`Db status should be "loaded" but is "${db.status}"`);

    try {
      setQueryState({ state: "dbQueryRunning" });
      const results = db.db.exec(statement);
      setQueryResults(results.map(rowsToObjects));
      setProgress({ queried: true });
      setQueryState({ state: "ready" });
      return results;
    } catch (err) {
      console.error(err);
      setQueryState({
        state: "dbQueryError",
        errorMessage: (err as Error).message,
      });
      setQueryResults([]);
      return [];
    }
  };

  const runTransformCode = async (
    results: TransformResult[],
    transformCode: string
  ) => {
    setQueryState({ state: "transformRunning" });
    const result = await execute(transformCode, { queryResults: results });
    if (result.success) {
      setTransformResult(result.returnValue || []);
      setProgress({ queried: true, transformed: true });
      setQueryState({ state: "ready" });
    } else {
      console.error(result.error);
      setQueryState({
        state: "transformError",
        error: result.error,
      });
    }
  };

  useEffect(() => {
    if (db.status === "error") {
      // This code branch is relevant when the query was initialized with a
      // valid DB and then switched to a failed one
      return;
    }
    if (!query.databaseSource || !databaseDefintion) {
      return;
    }

    if (db.status === "uninitialized") {
      setQueryState({ state: "dbInitializing" });
      initialize(query.databaseSource, databaseDefintion).catch(console.error);
      return;
    }

    if (db.status !== "loaded" || !query.sqlStatement) {
      return;
    }

    runQuery(db, query.sqlStatement);
    // query.sqlStatement is missing from the dependencies on purpose. Otherwise, the
    // sql query would be run on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, databaseDefintion, query.databaseSource]);

  // Update queryState when db changes
  useEffect(() => {
    setQueryState(getStateFromDbState(db));
  }, [db]);

  useEffect(() => {
    const run = async () => {
      if (!queryResults.length || db.status !== "loaded") {
        return;
      }

      if (query.transformType === "code") {
        await runTransformCode(queryResults, query.transformCode);
      } else {
        const firstQueryResult = queryResults[0];
        if (firstQueryResult) {
          const { dataOrientation, labelColumn } = query.transformConfig;
          const data =
            dataOrientation === "row"
              ? firstQueryResult
              : flipArrayOfObjects(firstQueryResult, labelColumn);
          setTransformResult(data);
          setProgress({ queried: true, transformed: true });
        }
      }
    };
    run().catch(console.error);
  }, [db, query, queryResults]);

  return {
    queryState,
    progress,
    queryResults,
    runQuery: (statement: string) => runQuery(db, statement),
    runTransform: runTransformCode,
    transformResult,
    dbSchema: db.status === "loaded" ? db.info : undefined,
  };
};

export default useQueryController;

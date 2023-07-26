import { useEffect, useState } from "react";
import { QueryExecResult } from "sql.js";
import * as ts from "typescript/lib/typescript";
import sourceMap from "source-map-js";

import { useQuery } from "./query/queryStore";
import { columnsToObjects, rowsToObjects } from "./util/transform";
import { TransformResult } from "./types";
import { getPositionFromStacktrace } from "./util/utils";
import { initialize } from "./util/database";
import useDatabaseDefinitionStore from "./databaseDefinitionStore";
import {
  DatabaseConnection,
  useDatabaseConnection,
} from "./databaseConnectionStore";

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
      position?: { line: number; column: number };
      error: Error;
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

const useQueryController = (queryId: string) => {
  const [progress, setProgress] = useState<Progress>({});

  const query = useQuery(queryId);
  const db = useDatabaseConnection(query.databaseSource.url);
  const databaseDefintion =
    useDatabaseDefinitionStore()[query.databaseSource.url];

  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
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
      setQueryResults(results);
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

  const runTransform = (results: QueryExecResult[], transformCode: string) => {
    // @ts-expect-error Hack for typescript in browser to not crash
    window.process = { versions: {} };
    const transpiled = ts.transpileModule(transformCode, {
      compilerOptions: { sourceMap: true },
    });

    const finalCode = `${transpiled.outputText}
      return transform(queryResult)
    `;

    try {
      setQueryState({ state: "transformRunning" });
      const func = new Function("queryResult", finalCode);
      const result = func(results);
      setTransformResult(result || []);
      setProgress({ queried: true, transformed: true });
      setQueryState({ state: "ready" });
    } catch (err) {
      console.error(err);

      const smc = new sourceMap.SourceMapConsumer(
        JSON.parse(transpiled.sourceMapText!)
      );

      const transpiledPosition = getPositionFromStacktrace(
        (err as Error).stack!
      );
      const position = transpiledPosition
        ? smc.originalPositionFor(transpiledPosition)
        : undefined;
      setQueryState({ state: "transformError", error: err as Error, position });
    }
  };

  useEffect(() => {
    if (db.status === "error") {
      // This code branch is relevant when the query was initialized with a
      // valid DB and dthen switched to a failed one
      setQueryState({ state: "dbInitError", errorMessage: db.error.message });
      return;
    }
    if (!query.databaseSource || !databaseDefintion) {
      return;
    }

    if (db.status === "uninitialized") {
      setQueryState({ state: "dbInitializing" });
      initialize(query.databaseSource, databaseDefintion).then((conn) => {
        if (conn.status === "error") {
          setQueryState({
            state: "dbInitError",
            errorMessage: conn.error.message,
          });
        }
      });
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

  useEffect(() => {
    if (!queryResults.length) {
      return;
    }

    if (query.transformType === "code") {
      runTransform(queryResults, query.transformCode);
    } else {
      const { dataOrientation, labelColumn } = query.transformConfig;
      const data =
        dataOrientation === "row"
          ? rowsToObjects(queryResults[0])
          : columnsToObjects(queryResults[0], labelColumn);
      setTransformResult(data);
      setProgress({ queried: true, transformed: true });
    }
  }, [db, query, queryResults]);

  return {
    queryState,
    progress,
    queryResults,
    runQuery: (statement: string) => runQuery(db, statement),
    runTransform,
    transformResult,
  };
};

export default useQueryController;

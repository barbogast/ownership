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

export type TransformError = {
  position?: { line: number; column: number };
  error: Error;
};

const useQueryController = (queryId: string) => {
  const [progress, setProgress] = useState<Progress>({});

  const query = useQuery(queryId);
  const db = useDatabaseConnection(query.databaseSource.url);
  const databaseDefintion =
    useDatabaseDefinitionStore()[query.databaseSource.url];

  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  const [transformResult, setTransformResult] = useState<TransformResult>([]);

  const [error, setError] = useState<TransformError>();

  const [transformError, setTransformError] = useState<{
    position?: { line: number; column: number };
    error: Error;
  }>();

  const runQuery = (
    db: DatabaseConnection,
    statement: string
  ): QueryExecResult[] => {
    if (db.status !== "loaded")
      throw new Error(`Db status should be "loaded" but is "${db.status}"`);

    try {
      setError(undefined);
      const results = db.db.exec(statement);
      setQueryResults(results);
      setProgress({ queried: true });
      return results;
    } catch (err) {
      console.error(err);
      setError({ error: err as Error });
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
      setTransformError(undefined);
      const func = new Function("queryResult", finalCode);
      const result = func(results);
      setTransformResult(result || []);
      setProgress({ queried: true, transformed: true });
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
      setTransformError({ error: err as Error, position });
    }
  };

  useEffect(() => {
    if (!query.databaseSource || !databaseDefintion) {
      return;
    }

    if (db.status === "uninitialized") {
      initialize(query.databaseSource, databaseDefintion).catch(console.error);
      return;
    }

    if (db.status === "loading" || !query.sqlStatement) {
      return;
    }

    const results = runQuery(db, query.sqlStatement);
    if (!results.length) {
      // DB query most probably resulted in an error
      return;
    }

    if (query.transformType === "code") {
      if (results.length) {
        runTransform(results, query.transformCode);
      }
    } else {
      const { dataOrientation, labelColumn } = query.transformConfig;
      const data =
        dataOrientation === "row"
          ? rowsToObjects(results[0])
          : columnsToObjects(results[0], labelColumn);
      setTransformResult(data);
      setProgress({ queried: true, transformed: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    db,
    databaseDefintion,
    query.databaseSource,
    query.transformCode,
    query.transformConfig,
    query.transformType,

    // query.sqlStatement,
    // This entry is missing from the dependencies on purpose. Otherwise, the
    // sql query would be run on every keystroke.
  ]);

  return {
    error,
    progress,
    queryResults,
    runQuery: () => runQuery(db, query.sqlStatement),
    runTransform,
    transformResult,
    transformError,
  };
};

export default useQueryController;

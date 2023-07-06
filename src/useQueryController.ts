import { useEffect, useState } from "react";
import { QueryExecResult } from "sql.js";
import * as ts from "typescript/lib/typescript";
import sourceMap from "source-map-js";

import { MyDatabase, initializeDb } from "./dbStore";
import { useQuery, TransformConfig } from "./query/queryStore";
import { rowsToObjects, columnsToObjects } from "./transform";
import { TransformResult } from "./types";
import { getPositionFromStacktrace } from "./utils";

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

  const [db, setDb] = useState<MyDatabase>({ status: "loading", key: "" });

  const query = useQuery(queryId);
  const {
    sqlStatement,
    transformType,
    databaseFileName,
    transformCode,
    transformConfig,
  } = query;

  const [queryResults, setQueryResults] = useState<QueryExecResult[]>([]);
  const [transformResult, setTransformResult] = useState<TransformResult>([]);

  const [error, setError] = useState<TransformError>();

  const [transformError, setTransformError] = useState<{
    position?: { line: number; column: number };
    error: Error;
  }>();

  const runQuery = (statement?: string): QueryExecResult[] => {
    if (db.status !== "loaded") throw new Error();

    try {
      setError(undefined);
      const results = db.db.exec(statement || sqlStatement);
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

  const applyTransformConfig = (
    transformConfig: TransformConfig,
    queryResults: QueryExecResult[]
  ) => {
    if (!queryResults.length) {
      return;
    }
    const { dataOrientation, labelColumn } = transformConfig;

    const data =
      dataOrientation === "column"
        ? rowsToObjects(queryResults[0])
        : columnsToObjects(queryResults[0], labelColumn);

    setTransformResult(data);
    setProgress({ queried: true, transformed: true });
  };

  useEffect(() => {
    const func = async () => {
      if (databaseFileName) {
        const db = await initializeDb(databaseFileName, true);
        setDb(db);
      }
    };
    func();
  }, [databaseFileName]);

  useEffect(() => {
    if (db.status !== "loaded" || !sqlStatement) {
      return;
    }
    const results = runQuery();
    if (!results.length) {
      // DB query most probably resulted in an error
      return;
    }

    // Run this hook only once after the component mounted and the DB was initialised
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.status]);

  useEffect(() => {
    if (transformType === "code") {
      if (queryResults.length) {
        runTransform(queryResults, transformCode);
      }
    } else {
      applyTransformConfig(transformConfig, queryResults);
    }
  }, [transformType, transformConfig, transformCode, queryResults]);

  return {
    error,
    progress,
    queryResults,
    runQuery,
    runTransform,
    transformResult,
    transformError,
  };
};

export default useQueryController;

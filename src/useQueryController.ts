import { useEffect, useState } from "react";
import { QueryExecResult } from "sql.js";
import { MyDatabase, initializeDb } from "./dbStore";
import { useQuery, TransformConfig } from "./query/queryStore";
import { rowsToObjects, columnsToObjects } from "./transform";
import { TransformResult } from "./types";

type Progress = {
  queried?: boolean;
  postProcessed?: boolean;
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
  const [postProcessResult, setPostProcessResult] = useState<TransformResult>(
    []
  );

  const [error, setError] = useState<Error>();

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
      setError(err as Error);
      setQueryResults([]);
      return [];
    }
  };

  const runPostProcess = (
    results: QueryExecResult[],
    transformCode: string
  ) => {
    try {
      const func = new Function("queryResult", transformCode);
      const result = func(results);
      setPostProcessResult(result || []);
      setProgress({ queried: true, postProcessed: true });
    } catch (err) {
      console.error(err);
      setError(err as Error);
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

    setPostProcessResult(data);
    setProgress({ queried: true, postProcessed: true });
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
        runPostProcess(queryResults, transformCode);
      }
    } else {
      applyTransformConfig(transformConfig, queryResults);
    }
  }, [transformType, transformConfig, transformCode, queryResults]);

  return {
    error,
    progress,
    queryResults,
    runPostProcess,
    runQuery,
    postProcessResult,
  };
};

export default useQueryController;

import { useEffect } from "react";
import { Database } from "sql.js";
import Papa from "papaparse";

import useDbConnStore, {
  DatabaseConnection,
  useDatabaseConnection,
} from "./databaseConnectionStore";
import { DatabaseSource } from "./query/queryStore";
import useDatabaseSourceStore from "./databaseSourceStore";
import { initializeDbFromCsv, initializeDbFromUrl } from "./util/database";
import { analyzeCsvHeader } from "./util/csv";

export type TransformError = {
  position?: { line: number; column: number };
  error: Error;
};

const useDb = (databaseSource: DatabaseSource | undefined) => {
  const db = useDatabaseConnection(databaseSource?.url || "");
  const { databases } = useDatabaseSourceStore();

  useEffect(() => {
    const f = async () => {
      if (!databaseSource || db.status !== "uninitialized") {
        return;
      }
      useDbConnStore.setState((state) => {
        state.databases[databaseSource.url] = {
          key: databaseSource.url,
          status: "loading",
        };
      });

      let connection: DatabaseConnection;
      const key = databaseSource.url;
      try {
        let db: Database;
        if (databaseSource.type === "remote") {
          db = await initializeDbFromUrl(databaseSource.url);
        } else {
          const result = Papa.parse<string[]>(
            databases[databaseSource.url].csvContent
          );
          const columns = analyzeCsvHeader(result.data);
          db = await initializeDbFromCsv(columns, result.data);
        }
        connection = { key, status: "loaded", db };
      } catch (err) {
        connection = { key, error: err as Error, status: "error" };
      }
      useDbConnStore.setState((state) => {
        state.databases[key] = connection;
      });
    };
    f().catch(console.error);
  }, [db.status, databases, databaseSource]);

  return db;
};

export default useDb;

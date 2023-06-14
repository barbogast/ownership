import {
  ReactElement,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import initSqlJs, { Database } from "sql.js";

// Re-export for convenience and DRY
export type { Database, QueryExecResult } from "sql.js";

type DbContextValue = {
  db: Database | undefined;
  error: Error | undefined;
};

export const DbContext = createContext<DbContextValue>({
  db: undefined,
  error: undefined,
});

export const Db: React.FC<{ children: ReactElement[] | ReactElement }> = ({
  children,
}) => {
  const [db, setDb] = useState<Database | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    (async () => {
      // sql.js needs to fetch its wasm file, so we cannot immediately instantiate the database
      // without any configuration, initSqlJs will fetch the wasm files directly from the same path as the js
      // see ../craco.config.js
      try {
        const SQL = await initSqlJs({
          locateFile: () =>
            window.location.host.startsWith("localhost")
              ? "/node_modules/sql.js/dist/sql-wasm.wasm?init"
              : "sql-wasm.wasm?init",
        });

        const res = await fetch("/database.sqlite");
        const buf = await res.arrayBuffer();
        setDb(new SQL.Database(new Uint8Array(buf)));
      } catch (err) {
        setError(err as Error);
      }
    })();
  }, []);

  return (
    <DbContext.Provider value={{ db, error }}>{children}</DbContext.Provider>
  );
};

export const useDb = () => useContext(DbContext).db;

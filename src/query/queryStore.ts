import { Draft } from "immer";

import { createId, deepCopy } from "../util/utils";
import { getNewLabel } from "../util/labels";
import { add } from "../modifiedStore";
import { ChartType } from "../display/Index";
import { FileContents } from "../util/fsHelper";
import NestedStore, { StoreConfig } from "../nestedStores";
import { defaultCode } from "../codeExecution/transformQuery";
import { stableStringify } from "../util/json";

export type TransformType = "config" | "code";
export type DataOrientation = "row" | "column";

export type TransformConfig = {
  dataOrientation: DataOrientation;
  selectedColumns: string[];
  labelColumn: string;
  dataRowIndex: number;
};

export type DatabaseSource =
  | {
      type: "local";
      id: string;
    }
  | {
      type: "remote";
      url: string;
    };

export type Query = {
  id: string;
  label: string;
  databaseFileName: string;
  databaseSource: DatabaseSource;
  sqlStatement: string;
  transformCode: string;
  chartType?: ChartType;
  transformType: TransformType;
  transformConfig: TransformConfig;
};

type QueryState = { [queryId: string]: Query };

export const getDefaults = (dataSourceId: string) => ({
  transformType: "config" as const,
  databaseSource: {
    type: "local" as const,
    id: dataSourceId,
  },
  transformConfig: {
    dataOrientation: "row" as const,
    selectedColumns: [],
    labelColumn: "",
    dataRowIndex: 0,
  },
  databaseFileName: "",
  sqlStatement: "",
  transformCode: defaultCode,
});

const initialState: QueryState = {};

const CURRENT_VERSION = 3;

const migrate = (unknownState: unknown, oldVersion: number) => {
  const state = unknownState as QueryState;

  if (oldVersion < 3) {
    Object.values(state).forEach((query) => {
      if (query.databaseSource.type === "local") {
        // @ts-expect-error query.databaseSource.url was available in version 2
        query.databaseSource.id = query.databaseSource.url;
        // @ts-expect-error query.databaseSource.url was available in version 2
        delete query.databaseSource.url;
      }
    });
  }

  return state as QueryState;
};

type Files = "index.json" | "sqlStatement.sql" | "transformCode.ts";

type QueryStoreConfig = StoreConfig<Query, Record<string, Query>, Files>;

export const queryToFiles = (query: Query): FileContents<Files> => {
  const { sqlStatement, transformCode, ...partialQuery } = query;
  const fileContents = {
    "index.json": stableStringify(partialQuery),
    "sqlStatement.sql": sqlStatement,
    "transformCode.ts": transformCode,
  };
  return fileContents;
};

export const filesToQuery = (fileContents: FileContents<Files>): Query => {
  return {
    ...JSON.parse(fileContents["index.json"]),
    sqlStatement: fileContents["sqlStatement.sql"],
    transformCode: fileContents["transformCode.ts"],
  };
};

export const queryStoreConfig: QueryStoreConfig = {
  entityToFiles: queryToFiles,
  filesToEntity: filesToQuery,
  name: "queries",
  initialState,
  version: CURRENT_VERSION,
  migrate,
};

export const queryStore = new NestedStore(queryStoreConfig);
const useQueryStore = queryStore.store;

export default useQueryStore;

export const useQuery = (id: string) => useQueryStore((state) => state[id]);

export const useQueriesByDatabase = (databaseId: string) =>
  useQueryStore((state) =>
    Object.values(state).filter(
      (query) =>
        query.databaseSource.type === "local" &&
        query.databaseSource.id === databaseId
    )
  );

export const addQuery = (dataSourceId: string) => {
  const id = createId();
  useQueryStore.setState((state) => {
    state[id] = {
      ...getDefaults(dataSourceId),
      id,
      label: "New query",
    };
  });
  return id;
};

const getQuery = (queryId: string) => {
  const query = useQueryStore.getState()[queryId];
  if (query === undefined) {
    throw new Error(`No query with id "${queryId}" found`);
  }
  return query;
};

const getQueryFromDraft = (state: Draft<QueryState>, queryId: string) => {
  const query = state[queryId];
  if (query === undefined) {
    throw new Error(`No query with id "${queryId}" found`);
  }
  return query;
};

export const importQuery = (query: Query) => {
  const id = createId();
  const existingLabels = Object.values(useQueryStore.getState()).map(
    (q) => q.label
  );
  const label = getNewLabel(existingLabels, query.label);
  useQueryStore.setState((state) => {
    state[id] = { ...query, id, label };
  });
  return id;
};

export const duplicate = (queryId: string) => {
  const sourceQuery = getQuery(queryId);
  const id = createId();
  const existingLabels = Object.values(useQueryStore.getState()).map(
    (q) => q.label
  );
  const label = getNewLabel(existingLabels, sourceQuery.label);

  useQueryStore.setState((state) => {
    state[id] = { ...deepCopy(sourceQuery), id, label };
  });
  return id;
};

export const remove = (queryId: string) => {
  const query = getQuery(queryId);
  const answer = confirm(`Are you sure to delete the query "${query.label}"?`);
  if (answer === true) {
    useQueryStore.setState((state) => {
      delete state[queryId];
    }, true);
    return true;
  }

  return false;
};

export const updateQuery = (
  queryId: string,
  newState: Partial<Omit<Query, "transformConfig">>
) => {
  add(queryId);
  useQueryStore.setState((state) => {
    const query = getQueryFromDraft(state, queryId);
    Object.assign(query, newState);
  });
};

export const updateTransformConfig = (
  queryId: string,
  newState: Partial<TransformConfig>
) => {
  useQueryStore.setState((state) => {
    const query = getQueryFromDraft(state, queryId);
    Object.assign(query.transformConfig, newState);
  });
  add(queryId);
};

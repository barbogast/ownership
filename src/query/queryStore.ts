import { v4 as uuidv4 } from "uuid";
import stringify from "safe-stable-stringify";

import { deepCopy } from "../util/utils";
import { getNewLabel } from "../util/labels";
import { add } from "../modifiedStore";
import getQueryTestData from "./queryStoreTestData";
import { ChartType } from "../display/Index";
import useDatabaseDefinitionStore from "../databaseDefinitionStore";
import { FileContents } from "../util/fsHelper";
import NestedStore, { StoreConfig } from "../nestedStores";

export type TransformType = "config" | "code";
export type DataOrientation = "row" | "column";

export type TransformConfig = {
  dataOrientation: DataOrientation;
  selectedColumns: string[];
  labelColumn: string;
  dataRowIndex: number;
};

export type DatabaseSource = {
  type: "remote" | "local";
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

const defaultTransformCode = `
type Value = string | number | null | TransformResult
type QueryResult = {values: Value[][], columns: string[]}[]
type TransformResult = Record<string, Value>[]

function transform(queryResult: QueryResult): TransformResult{
  // Your code here ...
}
`;

export const getDefaults = () => ({
  transformType: "config" as const,
  databaseSource: {
    type: "local" as const,
    url: Object.values(useDatabaseDefinitionStore.getState())[0]?.id,
  },
  transformConfig: {
    dataOrientation: "row" as const,
    selectedColumns: [],
    labelColumn: "",
    dataRowIndex: 0,
  },
  databaseFileName: "",
  sqlStatement: "",
  transformCode: defaultTransformCode,
});

const initialState: QueryState = getQueryTestData();

const CURRENT_VERSION = 2;

const migrate = (unknownState: unknown) => {
  const state = unknownState as QueryState;
  Object.keys(state.queries).forEach((id) => {
    state[id] = {
      ...getDefaults(),
      ...state[id],
    };
  });

  Object.keys(state.queries).forEach((id) => {
    state[id].transformConfig.selectedColumns =
      state[id].transformConfig.selectedColumns || [];
  });
  return state as QueryState;
};

type Files = "index.json" | "sqlStatement.sql" | "transformCode.ts";

type QueryStoreConfig = StoreConfig<Query, Record<string, Query>, Files>;

export const queryToFiles = (query: Query): FileContents<Files> => {
  const { sqlStatement, transformCode, ...partialQuery } = query;
  const fileContents = {
    "index.json": stringify(partialQuery, null, 2),
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

export const addQuery = () => {
  const id = uuidv4();
  useQueryStore.setState((state) => {
    state[id] = {
      ...getDefaults(),
      id,
      label: "New query",
    };
  });
  return id;
};

export const importQuery = (query: Query) => {
  const id = uuidv4();
  const existingLabels = Object.values(useQueryStore.getState()).map(
    (q) => q.label
  );
  const label = getNewLabel(existingLabels, query.label);
  useQueryStore.setState((state) => {
    state[id] = { ...getDefaults(), ...query, id, label };
  });
  return id;
};

export const duplicate = (queryId: string) => {
  const sourceQuery = useQueryStore.getState()[queryId];
  const id = uuidv4();
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
  const query = useQueryStore.getState()[queryId];
  const answer = confirm(`Are you sure to delete the query "${query.label}"?`);
  if (answer === true) {
    useQueryStore.setState((state) => {
      delete state[queryId];
    });
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
    Object.assign(state[queryId], newState);
  });
};

export const updateTransformConfig = (
  queryId: string,
  newState: Partial<TransformConfig>
) => {
  add(queryId);
  useQueryStore.setState((state) => {
    Object.assign(state[queryId].transformConfig, newState);
  });
};

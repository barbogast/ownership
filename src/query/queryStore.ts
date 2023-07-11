import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  PersistOptions,
  devtools,
} from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { immer } from "zustand/middleware/immer";
import { deepCopy } from "../util/utils";
import { getNewLabel } from "../util/labels";
import { add } from "../modifiedStore";
import { RepositoryInfo } from "../types";
import getQueryTestData from "./queryStoreTestData";
import { ChartType } from "../display/Index";
import useDatabaseDefinitionStore from "../databaseDefinitionStore";

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

type QueryState = {
  queries: { [queryId: string]: Query };
};

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
    url: Object.values(useDatabaseDefinitionStore.getState().databases)[0]
      ?.name,
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

const initialState: QueryState = {
  queries: getQueryTestData(),
};

const CURRENT_VERSION = 2;

const persistConfig: PersistOptions<QueryState> = {
  name: "uninitializedQueries",
  skipHydration: true,
  storage: createJSONStorage(() => localStorage),
  version: CURRENT_VERSION,
  migrate: (unknownState) => {
    const state = unknownState as QueryState;
    Object.keys(state.queries).forEach((id) => {
      state.queries[id] = {
        ...getDefaults(),
        ...state.queries[id],
      };
    });

    Object.keys(state.queries).forEach((id) => {
      state.queries[id].transformConfig.selectedColumns =
        state.queries[id].transformConfig.selectedColumns || [];
    });
    return state as QueryState;
  },
};

const getStorageName = (info: RepositoryInfo) => `${info.path}/queries`;

export const enable = (info: RepositoryInfo) => {
  useQueryStore.persist.setOptions({ name: getStorageName(info) });
  useQueryStore.persist.rehydrate();
};

export const importStore = (info: RepositoryInfo, queries: Query[]) => {
  const content: QueryState = {
    queries: Object.fromEntries(queries.map((query) => [query.id, query])),
  };
  localStorage.setItem(
    getStorageName(info),
    JSON.stringify({
      state: content,
      version: CURRENT_VERSION,
    })
  );
};

const useQueryStore = create(
  devtools(
    persist(
      immer<QueryState>(() => initialState),
      persistConfig
    )
  )
);

export default useQueryStore;

export const useQuery = (id: string) =>
  useQueryStore((state) => state.queries[id]);

export const addQuery = () => {
  const id = uuidv4();
  useQueryStore.setState((state) => {
    state.queries[id] = {
      ...getDefaults(),
      id,
      label: "New query",
    };
  });
  return id;
};

export const importQuery = (query: Query) => {
  const id = uuidv4();
  const existingLabels = Object.values(useQueryStore.getState().queries).map(
    (q) => q.label
  );
  const label = getNewLabel(existingLabels, query.label);
  useQueryStore.setState((state) => {
    state.queries[id] = { ...getDefaults(), ...query, id, label };
  });
  return id;
};

export const duplicate = (queryId: string) => {
  const sourceQuery = useQueryStore.getState().queries[queryId];
  const id = uuidv4();
  const existingLabels = Object.values(useQueryStore.getState().queries).map(
    (q) => q.label
  );
  const label = getNewLabel(existingLabels, sourceQuery.label);

  useQueryStore.setState((state) => {
    state.queries[id] = { ...deepCopy(sourceQuery), id, label };
  });
  return id;
};

export const remove = (queryId: string) => {
  const query = useQueryStore.getState().queries[queryId];
  const answer = confirm(`Are you sure to delete the query "${query.label}"?`);
  if (answer === true) {
    useQueryStore.setState((state) => {
      delete state.queries[queryId];
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
    Object.assign(state.queries[queryId], newState);
  });
};

export const updateTransformConfig = (
  queryId: string,
  newState: Partial<TransformConfig>
) => {
  add(queryId);
  useQueryStore.setState((state) => {
    Object.assign(state.queries[queryId].transformConfig, newState);
  });
};

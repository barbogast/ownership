import { Draft } from "immer";
import * as R from "remeda";

import { createId } from "../util/utils";
import { getNewLabel } from "../util/labels";
import { add } from "../modifiedStore";
import { ChartConfig } from "../display/Index";
import { Folder, getFile, getFolder } from "../util/fsHelper";
import NestedStore, { StoreConfig } from "../nestedStores";
import { parseJson, stableStringify } from "../util/json";
import { CURRENT_VERSION, migrations } from "./migrations";

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
  chartConfig: ChartConfig;
  transformType: TransformType;
  transformConfig: TransformConfig;
};

export type QueryState = Record<string, Query>;

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
  transformCode: "",
  chartConfig: { chartType: "lineChart" as const },
});

const initialState: QueryState = {};

type QueryStoreConfig = StoreConfig<Query, Record<string, Query>>;

export const exportToFolder = (state: QueryState): Folder => {
  const queryFolder: Folder = { files: {}, folders: {} };
  for (const query of Object.values(state)) {
    const { sqlStatement, transformCode, chartConfig, ...partialQuery } = query;
    const vegaSpec =
      chartConfig?.chartType === "vegaChart" ? chartConfig.vegaSpec : "";
    queryFolder.folders[query.id] = {
      files: {
        "index.json": stableStringify({
          ...partialQuery,
          chartConfig: chartConfig
            ? chartConfig.chartType === "vegaChart"
              ? R.omit(chartConfig, ["vegaSpec"])
              : chartConfig
            : undefined,
        }),
        "sqlStatement.sql": sqlStatement,
        "transformCode.ts": transformCode,
        "vegaSpec.json": vegaSpec,
      },
      folders: {},
    };
  }
  return { files: {}, folders: { queries: queryFolder } };
};

export const importFromFolder = (root: Folder): QueryState =>
  R.mapValues(getFolder(root, "queries").folders, (folder) => {
    const query = {
      ...parseJson(getFile(folder, "index.json")),
      sqlStatement: getFile(folder, "sqlStatement.sql", ""),
      transformCode: getFile(folder, "transformCode.ts", ""),
    } as Query;
    if (query.chartConfig.chartType === "vegaChart") {
      query.chartConfig.vegaSpec = getFile(folder, "vegaSpec.json");
    }
    return query;
  });

export const queryStoreConfig: QueryStoreConfig = {
  exportToFolder,
  importFromFolder,
  name: "queries",
  initialState,
  version: CURRENT_VERSION,
  migrations,
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
    state[id] = { ...R.clone(sourceQuery), id, label };
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

export const replaceQuery = (queryId: string, newState: Query) => {
  add(queryId);
  useQueryStore.setState((state) => {
    state[queryId] = newState;
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

export const updateChartConfig = (
  queryId: string,
  newState: Partial<ChartConfig>
) => {
  useQueryStore.setState((state) => {
    const query = getQueryFromDraft(state, queryId);
    Object.assign(query.chartConfig, newState);
  });
  add(queryId);
};

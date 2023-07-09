import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  PersistOptions,
  devtools,
} from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { immer } from "zustand/middleware/immer";
import { deepCopy, getNewLabel } from "../utils";
import { add } from "../modifiedStore";
import { RepositoryInfo } from "../types";

export type ChartType =
  | "table"
  | "barChart"
  | "stackedBarChart"
  | "pieChart"
  | "stackedPieChart"
  | "lineChart";

export const SINGLE_DATASET_CHART_TYPES: ChartType[] = ["barChart", "pieChart"];

export type TransformType = "config" | "code";
export type DataOrientation = "row" | "column";

export type TransformConfig = {
  dataOrientation: DataOrientation;
  selectedColumns: string[];
  labelColumn: string;
  dataRowIndex: number;
};

export type Query = {
  id: string;
  label: string;
  databaseFileName: string;
  sqlStatement: string;
  transformCode: string;
  chartType?: ChartType;
  transformType: TransformType;
  transformConfig: TransformConfig;
};

type QueryState = {
  queries: { [queryId: string]: Query };
};

const code1 = `
type Value = string | number | null
type QueryResult = {values: Value[][], colums: string[]}[]
type TransformResult = Record<string, Value>[]

function transform(queryResult: QueryResult): TransformResult{
  return queryResult[0].values.map((row) => {
    const mappedValues = Object.fromEntries(queryResult[0].columns.map((k, i) => [k, row[i]]));
    return {
      name: "Year",
      value: mappedValues.year,
      children: [
        {
          name: "Total",
          value: mappedValues.total,
          children: [
            {
              name: "Residents",
              value: mappedValues.residents,
              children: [
                { name: "Central Bank", value: mappedValues.central_bank },
                { name: "OMFIs", value: mappedValues.omfis },
                { name: "Other financial institutions", value: mappedValues.other_financial_institutions },
                { name: "Other Residents", value: mappedValues.other_residents },
              ],
            },
            { name: "Non-Residents", value: mappedValues.non_residents },
          ],
        },
      ],
    };
  });
}`;

const query = `
select category_1 from aaa where category_1 is not null group by category_1 order by category_1;
select category_2 from aaa where category_2 is not null group by category_2 order by category_2;
select category_3 from aaa where category_3 is not null group by category_3 order by category_3;
select category_4 from aaa where category_4 is not null group by category_4  order by category_4;`;

const code2 = `
type Value = string | number | null
type QueryResult = {values: Value[][], colums: string[]}[]
type TransformResult = Record<string, Value>[]

function transform(queryResult: QueryResult): TransformResult{
  const valueArrays = queryResult.map(({values}) => values)
  const [cat1, cat2, cat3, cat4] = queryResult.map(res => res.values.map(row => row[0]))


  const maxLength = Math.max(...valueArrays.map(arr => arr.length))


  const data = Array(maxLength).fill(null).map((_, i) => ({
    category1: cat1[i],
    category2: cat2[i],
    category3: cat3[i],
    category4: cat4[i]
  }))
  return data
}
`;

const defaultTransformCode = `
type Value = string | number | null | TransformResult
type QueryResult = {values: Value[][], columns: string[]}[]
type TransformResult = Record<string, Value>[]

function transform(queryResult: QueryResult): TransformResult{
  // Your code here ...
}
`;

const getDefaults = () => ({
  transformType: "config" as const,
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
  queries: {
    tableofownershipdetails: {
      ...getDefaults(),
      id: "tableofownershipdetails",
      label: "Debt ownership: Details",
      databaseFileName: "database.sqlite",
      sqlStatement: "select * from aaa",
      transformType: "code",
      transformCode: code1,
      chartType: "table",
    },
    tableofownershipdistribution: {
      ...getDefaults(),
      id: "tableofownershipdistribution",
      label: "Debt ownership: Distribution",
      databaseFileName: "database.sqlite",
      sqlStatement:
        "select central_bank, omfis, other_financial_institutions, other_residents from aaa",
      transformCode: "",
      chartType: "pieChart",
    },
    tableofownershiptime: {
      ...getDefaults(),
      id: "tableofownershiptime",
      label: "Debt ownership: Time",
      databaseFileName: "database.sqlite",
      sqlStatement:
        "select central_bank, omfis, other_financial_institutions, other_residents from aaa",
      transformCode: "",
      chartType: "barChart",
    },
    categoryanalysis: {
      ...getDefaults(),
      id: "categoryanalysis",
      label: "Category Analysis",
      databaseFileName: "database2.sqlite",
      sqlStatement: query,
      transformCode: code2,
      transformType: "code",
      chartType: "table",
    },
  },
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

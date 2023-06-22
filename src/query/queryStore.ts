import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { immer } from "zustand/middleware/immer";
import { deepCopy, getNewLabel } from "../utils";

type ChartType = "table" | "barChart" | "pieChart" | "lineChart";

export type Query = {
  id: string;
  label: string;
  databaseFileName: string;
  sqlStatement: string;
  enableTransform: boolean;
  transformCode: string;
  chartType?: ChartType;
};

type QueryState = {
  queries: { [queryId: string]: Query };
};

const code1 = `
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
});`;

const query = `
select category_1 from aaa where category_1 is not null group by category_1 order by category_1;
select category_2 from aaa where category_2 is not null group by category_2 order by category_2;
select category_3 from aaa where category_3 is not null group by category_3 order by category_3;
select category_4 from aaa where category_4 is not null group by category_4  order by category_4;`;

const code2 = `
const valueArrays = queryResult.map(({values}) => values)
const [cat1, cat2, cat3, cat4] = queryResult.map(res => res.values.map(row => row[0]))


const maxLength = Math.max(...valueArrays.map(arr => arr.length))


const data = Array(maxLength).fill().map((_, i) => ({
  category1: cat1[i],
  category2: cat2[i],
  category3: cat3[i],
  category4: cat4[i]
}))
return data
`;

const initialState: QueryState = {
  queries: {
    tableofownershipdetails: {
      id: "tableofownershipdetails",
      label: "Debt ownership: Details",
      databaseFileName: "database.sqlite",
      sqlStatement: "select * from aaa",
      enableTransform: true,
      transformCode: code1,
      chartType: "table",
    },
    tableofownershipdistribution: {
      id: "tableofownershipdistribution",
      label: "Debt ownership: Distribution",
      databaseFileName: "database.sqlite",
      sqlStatement:
        "select central_bank, omfis, other_financial_institutions, other_residents from aaa",
      enableTransform: false,
      transformCode: "",
      chartType: "pieChart",
    },
    tableofownershiptime: {
      id: "tableofownershiptime",
      label: "Debt ownership: Time",
      databaseFileName: "database.sqlite",
      sqlStatement:
        "select central_bank, omfis, other_financial_institutions, other_residents from aaa",
      enableTransform: false,
      transformCode: "",
      chartType: "barChart",
    },
    categoryanalysis: {
      id: "categoryanalysis",
      label: "Category Analysis",
      databaseFileName: "database2.sqlite",
      sqlStatement: query,
      enableTransform: true,
      transformCode: code2,
      chartType: "table",
    },
  },
};

const persistConfig = {
  name: "queries",
  storage: createJSONStorage(() => localStorage),
};

const useQueryStore = create(
  persist(
    immer<QueryState>(() => initialState),
    persistConfig
  )
);

export default useQueryStore;

export const useQuery = (id: string) =>
  useQueryStore((state) => state.queries[id]);

export const addQuery = () => {
  const id = uuidv4();
  useQueryStore.setState((state) => {
    state.queries[id] = {
      id,
      label: "New query",
      databaseFileName: "",
      sqlStatement: "",
      enableTransform: false,
      transformCode: "",
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
    state.queries[id] = { ...query, id, label };
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
export const updateLabel = (queryId: string, label: string) =>
  useQueryStore.setState((state) => {
    state.queries[queryId].label = label;
  });

export const updateDatabaseFileName = (
  queryId: string,
  databaseFileName: string
) =>
  useQueryStore.setState((state) => {
    state.queries[queryId].databaseFileName = databaseFileName;
  });

export const updateSqlStatement = (queryId: string, statement: string) =>
  useQueryStore.setState((state) => {
    state.queries[queryId].sqlStatement = statement;
  });

export const updateEnableTransform = (queryId: string, enable: boolean) =>
  useQueryStore.setState((state) => {
    state.queries[queryId].enableTransform = enable;
  });

export const updateTransformCode = (queryId: string, code: string) =>
  useQueryStore.setState((state) => {
    state.queries[queryId].transformCode = code;
  });

export const updateChartType = (queryId: string, chartType: ChartType) =>
  useQueryStore.setState((state) => {
    state.queries[queryId].chartType = chartType;
  });

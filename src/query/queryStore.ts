import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { immer } from "zustand/middleware/immer";

type ChartType = "table" | "barChart" | "pieChart";

type Query = {
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

const code = `
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

const initialState: QueryState = {
  queries: {
    tableofownershipdetails: {
      id: "tableofownershipdetails",
      label: "Debt ownership: Details",
      databaseFileName: "database.sqlite",
      sqlStatement: "select * from aaa",
      enableTransform: true,
      transformCode: code,
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

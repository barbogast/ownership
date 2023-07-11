import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type DatabaseDefinition = {
  name: string;
  csvContent: string;
};

type DatabaseState = {
  databases: Record<string, DatabaseDefinition>;
};

const initialState: DatabaseState = {
  databases: {},
};

const persistConfig = {
  name: "databases",
  storage: createJSONStorage(() => localStorage),
};

const useDatabaseDefinitionStore = create(
  persist(
    immer<DatabaseState>(() => initialState),
    persistConfig
  )
);

export const addDatabaseDefinition = (name: string, csvContent: string) => {
  useDatabaseDefinitionStore.setState((state) => {
    state.databases[name] = { name, csvContent };
  });
};

export default useDatabaseDefinitionStore;

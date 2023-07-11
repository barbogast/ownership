import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type Database = {
  name: string;
  csvContent: string;
};

type DatabaseState = {
  databases: Record<string, Database>;
};

const initialState: DatabaseState = {
  databases: {},
};

const persistConfig = {
  name: "databases",
  storage: createJSONStorage(() => localStorage),
};

const useDatabaseSourceStore = create(
  persist(
    immer<DatabaseState>(() => initialState),
    persistConfig
  )
);

export const addDatabase = (name: string, csvContent: string) => {
  useDatabaseSourceStore.setState((state) => {
    state.databases[name] = { name, csvContent };
  });
};

export default useDatabaseSourceStore;

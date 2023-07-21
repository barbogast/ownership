import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type ModifiedState = {
  modifiedQueries: string[];
};

const initialState: ModifiedState = {
  modifiedQueries: [],
};

const persistConfig = {
  name: "modifiedQueries",
  storage: createJSONStorage(() => localStorage),
};

const useModifiedStore = create(
  persist(
    immer<ModifiedState>(() => initialState),
    persistConfig
  )
);

export const add = (queryId: string) =>
  useModifiedStore.setState((state) => {
    if (!state.modifiedQueries.includes(queryId)) {
      state.modifiedQueries.push(queryId);
    }
  });

export const reset = () => useModifiedStore.setState(() => initialState);

export default useModifiedStore;

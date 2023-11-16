import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type LocalSettigsState = {
  darkModeEnabled: boolean;
};

const initialState: LocalSettigsState = {
  darkModeEnabled:
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches,
};

const persistConfig = {
  name: "localSettings",
  storage: createJSONStorage(() => localStorage),
};

const useLocalSettingsStore = create(
  persist(
    immer<LocalSettigsState>(() => initialState),
    persistConfig
  )
);

export default useLocalSettingsStore;

export const setDarkMode = (enabled: boolean) => {
  useLocalSettingsStore.setState((state) => {
    state.darkModeEnabled = enabled;
  });
};

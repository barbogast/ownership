import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { immer } from "zustand/middleware/immer";
import { RepositoryInfo } from "../types";

type Repository = {
  id: string;
  organization: string;
  repository: string;
};

type RepositoryState = {
  repositories: { [repositoryId: string]: Repository };
};

const initialState: RepositoryState = {
  repositories: {},
};

const persistConfig = {
  name: "repositories",
  storage: createJSONStorage(() => localStorage),
};

const useRepositoryStore = create(
  persist(
    immer<RepositoryState>(() => initialState),
    persistConfig
  )
);

export default useRepositoryStore;

export const useRepository = (id: string) =>
  useRepositoryStore((state) => state.repositories[id]);

export const addRepository = (info: RepositoryInfo) => {
  const id = uuidv4();
  useRepositoryStore.setState((state) => {
    state.repositories[id] = {
      id,
      organization: info.organization,
      repository: info.repository,
    };
  });
  return id;
};

export const updateRepository = (
  repositoryId: string,
  update: Partial<Omit<Repository, "id">>
) => {
  useRepositoryStore.setState((state) => {
    Object.assign(state.repositories[repositoryId], update);
  });
};

export const updateRepositoryName = (
  repositoryId: string,
  repository: string
) => {
  useRepositoryStore.setState((state) => {
    state.repositories[repositoryId].repository = repository;
  });
};

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { RepositoryInfo } from "../types";
import { Draft } from "immer";
import { createId } from "../util/utils";
import { useLocation } from "wouter";

export type Repository = {
  id: string;
  organization: string;
  repository: string;
  name: string;
};

export type RepositoryState = {
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

export const useRepositoryByName = (name: string) =>
  useRepositoryStore((state) => {
    const repo = Object.values(state.repositories).find(
      (repo) => repo.name === name
    );
    if (!repo) {
      throw new Error("No repo");
    }
    return repo;
  });

export const useRepositoryFromUrl = () => {
  const [location] = useLocation();
  const [_, name] = location.split("/");
  return useRepositoryStore((state) => {
    const repo = Object.values(state.repositories).find(
      (repo) => repo.name === name
    );
    return repo;
  });
};

const getRepoFromDraft = (state: Draft<RepositoryState>, repoId: string) => {
  const repo = state.repositories[repoId];
  if (repo === undefined) {
    throw new Error(`No repository with id "${repoId}" found`);
  }
  return repo;
};

export const addRepository = (info: RepositoryInfo, name: string) => {
  const id = createId();
  useRepositoryStore.setState((state) => {
    state.repositories[id] = {
      id,
      organization: info.organization,
      repository: info.repository,
      name,
    };
  });
  return id;
};

export const updateRepository = (
  repositoryId: string,
  update: Partial<Omit<Repository, "id">>
) => {
  useRepositoryStore.setState((state) => {
    const repo = getRepoFromDraft(state, repositoryId);
    Object.assign(repo, update);
  });
};

export const deleteRepository = (repositoryId: string) => {
  useRepositoryStore.setState((state) => {
    delete state.repositories[repositoryId];
  });
};

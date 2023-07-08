import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { immer } from "zustand/middleware/immer";

type Project = {
  id: string;
  organization: string;
  repository: string;
};

type ProjectsState = {
  projects: { [projectId: string]: Project };
};

const initialState: ProjectsState = {
  projects: {},
};

const persistConfig = {
  name: "projects",
  storage: createJSONStorage(() => localStorage),
};

const useProjectStore = create(
  persist(
    immer<ProjectsState>(() => initialState),
    persistConfig
  )
);

export default useProjectStore;

export const useProject = (id: string) =>
  useProjectStore((state) => state.projects[id]);

export const addProject = (organization: string, repository: string) => {
  const id = uuidv4();
  useProjectStore.setState((state) => {
    state.projects[id] = {
      id,
      organization,
      repository,
    };
  });
  return id;
};

export const updateProject = (
  projectId: string,
  update: Partial<Omit<Project, "id">>
) => {
  useProjectStore.setState((state) => {
    Object.assign(state.projects[projectId], update);
  });
};

export const updateRepositoryName = (projectId: string, repository: string) => {
  useProjectStore.setState((state) => {
    state.projects[projectId].repository = repository;
  });
};

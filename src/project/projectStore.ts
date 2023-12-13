import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Draft } from "immer";
import { createId } from "../util/utils";
import { useLocation } from "wouter";

export type Project = {
  id: string;
  name: string;
};

export type ProjectStoreState = Record<string, Project>;

const initialState: ProjectStoreState = {};

const persistConfig = {
  name: "projects",
  storage: createJSONStorage(() => localStorage),
};

const useProjectStore = create(
  persist(
    immer<ProjectStoreState>(() => initialState),
    persistConfig
  )
);

export default useProjectStore;

export const useProject = (id: string) => useProjectStore((state) => state[id]);

export const useProjectByName = (name: string) =>
  useProjectStore((state) => {
    const project = Object.values(state).find(
      (project) => project.name === name
    );
    if (!project) {
      throw new Error("No project");
    }
    return project;
  });

export const useProjectFromUrl = () => {
  const [location] = useLocation();
  const [_, name] = location.split("/");
  return useProjectStore((state) => {
    const project = Object.values(state).find(
      (project) => project.name === name
    );
    return project;
  });
};

const getProjectFromDraft = (
  state: Draft<ProjectStoreState>,
  projectId: string
) => {
  const project = state[projectId];
  if (project === undefined) {
    throw new Error(`No project with id "${projectId}" found`);
  }
  return project;
};

export const addProject = (name: string) => {
  const id = createId();
  useProjectStore.setState((state) => {
    state[id] = {
      id,
      name,
    };
  });
  return id;
};

export const updateProject = (
  projectId: string,
  update: Partial<Omit<Project, "id">>
) => {
  useProjectStore.setState((state) => {
    const project = getProjectFromDraft(state, projectId);
    Object.assign(project, update);
  });
};

export const deleteProject = (projectId: string) => {
  useProjectStore.setState((state) => {
    delete state[projectId];
  });
};

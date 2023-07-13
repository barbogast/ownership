import { FileContents } from "../util/fsHelper";
import {
  PersistOptions,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type StoreConfig<
  EntityProp extends string,
  IdProp extends string,
  Entity extends Record<IdProp | string, unknown>,
  Files extends string,
  State extends Record<EntityProp, Record<string, Entity>>
> = {
  entityToFiles: (entity: Entity) => FileContents<Files>;
  filesToEntity: (files: FileContents<Files>) => Entity;
  name: string;
  entityProp: EntityProp;
  idProp: string;
  initialState: State;
  version: number;
  migrate?: (state: unknown) => State;
};

export const createNestedStore = <
  EntityProp extends string,
  IdProp extends string,
  Entity extends Record<IdProp | string, unknown>,
  Files extends string,
  State extends Record<EntityProp, Record<string, Entity>>
>(
  config: StoreConfig<EntityProp, IdProp, Entity, Files, State>
) => {
  const persistConfig: PersistOptions<State> = {
    storage: createJSONStorage(() => localStorage),
    name: `uninitialized${config.name}`,
    skipHydration: true,
    version: config.version,
    migrate: config.migrate,
    merge: (persistedState, currentState) =>
      (persistedState as State) || // Drop previous state when rehydrating
      currentState, // ... or use the initialState if there is no previous state
  };
  console.log("create", config.name, config.initialState);

  const store = create(
    devtools(
      persist(
        immer<State>(() => config.initialState),
        persistConfig
      )
    )
  );

  return store;
};

// type Store = ReturnType<typeof createNestedStore>;

// const getStoragePath = <
//   EntityProp extends string,
//   IdProp extends string,
//   Entity extends Record<IdProp | string, unknown>,
//   Files extends string,
//   State extends Record<EntityProp, Record<string, Entity>>
// >(
//   config: StoreConfig<EntityProp, IdProp, Entity, Files, State>,
//   info: RepositoryInfo
// ) => `${info.path}/${config.name}`;

// export const enable = <
//   EntityProp extends string,
//   IdProp extends string,
//   Entity extends Record<IdProp | string, unknown>,
//   Files extends string,
//   State extends Record<EntityProp, Record<string, Entity>>
// >(
//   store: Store,
//   config: StoreConfig<EntityProp, IdProp, Entity, Files, State>,
//   info: RepositoryInfo
// ) => {
//   store.persist.setOptions({ name: getStoragePath(config, info) });
//   store.persist.rehydrate();
// };

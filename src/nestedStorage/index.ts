import { FileContents } from "../util/fsHelper";
import {
  PersistOptions,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { RepositoryInfo } from "../types";

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

class NestedStore<
  EntityProp extends string,
  IdProp extends string,
  Entity extends Record<IdProp | string, unknown>,
  Files extends string,
  State extends Record<EntityProp, Record<string, Entity>>
> {
  store: ReturnType<
    typeof create<
      State,
      [
        ["zustand/devtools", State],
        ["zustand/persist", State],
        ["zustand/immer", State]
      ]
    >
  >;
  config: StoreConfig<EntityProp, IdProp, Entity, Files, State>;
  info: RepositoryInfo | undefined;

  constructor(config: StoreConfig<EntityProp, IdProp, Entity, Files, State>) {
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

    this.config = config;
    this.store = create(
      devtools(
        persist(
          immer<State>(() => config.initialState),
          persistConfig
        )
      )
    );
  }

  #getStoragePath = (info: RepositoryInfo) =>
    `${info.path}/${this.config.name}`;

  hydrate = (info: RepositoryInfo) => {
    this.info = info;
    this.store.persist.setOptions({ name: this.#getStoragePath(this.info) });
    console.log(1111, this.#getStoragePath(this.info));
    this.store.persist.rehydrate();
  };

  import = (info: RepositoryInfo, entities: Entity[]) => {
    const content = {
      queries: Object.fromEntries(
        entities.map((entity) => [entity[this.config.idProp], entity])
      ),
    };
    localStorage.setItem(
      this.#getStoragePath(info),
      JSON.stringify({
        state: content,
        version: this.config.version,
      })
    );
  };
}

export default NestedStore;

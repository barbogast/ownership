import { FileContents } from "../util/fsHelper";
import {
  DevtoolsOptions,
  PersistOptions,
  PersistStorage,
  devtools,
  persist,
} from "zustand/middleware";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import * as idb from "idb-keyval";
import { RepositoryInfo } from "../types";
import Logger from "../util/logger";

const logger = new Logger("nestedStore");

export const migrate = <State>(
  oldState: unknown,
  version: number,
  config: {
    version: number;
    migrations: Record<string, (state: State) => State>;
  }
) => {
  let state = oldState as State;

  try {
    while (version < config.version) {
      logger.log(`migrate version ${version} to version ${version + 1}`);
      const migrationFunction = config.migrations[version];
      if (!migrationFunction) {
        throw new Error(`Couldn't find migration function for ${version}`);
      }
      state = migrationFunction(state);
      version += 1;
    }
  } catch (e) {
    console.error(e);
    throw new Error("Migration failed");
  }

  return state;
};

export type StoreConfig<
  Entity extends Record<"id" | string, unknown>,
  State extends Record<string, Entity>,
  Files extends string = string
> = {
  entityToFiles: (entity: Entity) => FileContents<Files>;
  filesToEntity: (files: FileContents<Files>) => Entity;
  name: string;
  initialState: State;
  version: number;
  migrations: Record<string, (state: State) => State>;
};

class NestedStore<
  Entity extends { id: string } & Record<string, unknown>,
  State extends Record<string, Entity>,
  Files extends string = string
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
  config: StoreConfig<Entity, State, Files>;
  info: RepositoryInfo | undefined;

  constructor(config: StoreConfig<Entity, State>) {
    const storage: PersistStorage<State> = {
      getItem: async (name) => {
        return (await idb.get(name)) ?? null;
      },
      setItem: idb.set,
      removeItem: idb.del,
    };

    const persistConfig: PersistOptions<State> = {
      storage: storage,
      name: `uninitialized${config.name}`,
      skipHydration: true,
      version: config.version,
      migrate: (state, version) => migrate(state, version, config),
      merge: (persistedState) =>
        (persistedState as State) || // Drop previous state when rehydrating
        config.initialState, // ... or use the initialState if there is no previous state
    };

    const devToolsConfig: DevtoolsOptions = {
      store: config.name,
    };

    this.config = config;
    this.store = create(
      devtools(
        persist(
          immer<State>(() => config.initialState),
          persistConfig
        ),
        devToolsConfig
      )
    );
  }

  #getStoragePath = (info: RepositoryInfo) =>
    `${info.path}/${this.config.name}`;

  hydrate = (info: RepositoryInfo) => {
    this.info = info;
    this.store.persist.setOptions({ name: this.#getStoragePath(this.info) });
    void this.store.persist.rehydrate();
  };

  import = async (info: RepositoryInfo, folders: FileContents<Files>[]) => {
    const state: Record<string, Entity> = {};
    for (const fileContent of folders) {
      const entity = this.config.filesToEntity(fileContent);
      state[entity.id] = entity;
    }

    await idb.set(this.#getStoragePath(info), {
      state,
      version: this.config.version,
    });
  };

  export = () => {
    const folders: Record<string, FileContents<Files>> = {};
    for (const entry of Object.values<Entity>(this.store.getState())) {
      const files = this.config.entityToFiles(entry);

      const filesWithContent: FileContents<string> = {};
      for (const [filename, content] of Object.entries<string | undefined>(
        files
      )) {
        if (content) {
          filesWithContent[filename] = content;
        }
      }

      folders[entry.id] = filesWithContent;
    }

    return folders;
  };

  delete = async (info: RepositoryInfo) => {
    await idb.del(this.#getStoragePath(info));
  };
}

export default NestedStore;

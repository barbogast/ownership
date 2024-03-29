import { Folder } from "../util/fsHelper";
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
  State extends Record<string, Entity>
> = {
  exportToFolder: (state: State) => Folder;
  importFromFolder: (folder: Folder) => State;
  name: string;
  initialState: State;
  version: number;
  migrations: Record<string, (state: State) => State>;
};

class NestedStore<
  Entity extends { id: string } & Record<string, unknown>,
  State extends Record<string, Entity>
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
  config: StoreConfig<Entity, State>;
  storeId: string | undefined;

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

  #getStoragePath = (storeId: string) => `${storeId}/${this.config.name}`;

  hydrate = (storeId: string) => {
    this.storeId = storeId;
    this.store.persist.setOptions({
      name: this.#getStoragePath(storeId),
    });
    void this.store.persist.rehydrate();
  };

  import = async (storeId: string, folder: Folder) => {
    this.storeId = storeId;
    await idb.set(this.#getStoragePath(storeId), {
      state: this.config.importFromFolder(folder),
      version: this.config.version,
    });
  };

  export = () => {
    return this.config.exportToFolder(this.store.getState());
  };

  delete = async (storeId: string) => {
    await idb.del(this.#getStoragePath(storeId));
  };
}

export default NestedStore;

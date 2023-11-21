import { FileContents } from "../util/fsHelper";
import {
  DevtoolsOptions,
  PersistOptions,
  createJSONStorage,
  devtools,
  persist,
} from "zustand/middleware";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { RepositoryInfo } from "../types";
import Logger from "../util/logger";

const logger = new Logger("nestedStore");

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
    const migrate = (oldState: unknown, version: number) => {
      let state = oldState as State;

      try {
        while (version < config.version) {
          logger.log("migrate", { version });
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

    const persistConfig: PersistOptions<State> = {
      storage: createJSONStorage(() => localStorage),
      name: `uninitialized${config.name}`,
      skipHydration: true,
      version: config.version,
      migrate,
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

  import = (info: RepositoryInfo, folders: FileContents<Files>[]) => {
    const state: Record<string, Entity> = {};
    for (const fileContent of folders) {
      const entity = this.config.filesToEntity(fileContent);
      state[entity.id] = entity;
    }

    localStorage.setItem(
      this.#getStoragePath(info),
      JSON.stringify({
        state,
        version: this.config.version,
      })
    );
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

  delete = (info: RepositoryInfo) => {
    localStorage.removeItem(this.#getStoragePath(info));
  };
}

export default NestedStore;

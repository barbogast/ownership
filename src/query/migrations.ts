import { QueryState } from "./queryStore";

const migrate_2_to_3 = (state: QueryState) => {
  Object.values(state).forEach((query) => {
    if (query.databaseSource.type === "local") {
      // @ts-expect-error query.databaseSource.url was available in version 2
      query.databaseSource.id = query.databaseSource.url;
      // @ts-expect-error query.databaseSource.url was available in version 2
      delete query.databaseSource.url;
    }
  });
  return state;
};

const migrate_3_to_4 = (state: QueryState) => {
  Object.values(state).forEach((query) => {
    // @ts-expect-error query.databaseSource.url was available in version 3
    query.chartConfig = query.chartType
      ? {
          // @ts-expect-error query.databaseSource.url was available in version 3
          chartType: query.chartType,
        }
      : undefined;

    // @ts-expect-error query.databaseSource.url was available in version 3
    delete query.chartType;
  });
  return state;
};

export const migrations: Record<string, (state: QueryState) => QueryState> = {
  2: migrate_2_to_3,
  3: migrate_3_to_4,
};

export const CURRENT_VERSION = 4;

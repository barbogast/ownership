import * as R from "remeda";

const ALL_CATEGORIES = [
  "main",
  "transform",
  "sql",
  "database",
  "git",
  "fs",
  "csv",
  "wizard",
  "codeExecution",
  "nestedStore",
  "chart",
  "gitTest",
  "sh",
] as const;
type LogCategory = (typeof ALL_CATEGORIES)[number];

class Logger {
  timers: Record<string, number>;
  static activeCategories: readonly LogCategory[] = [];

  static enable(...categories: LogCategory[]) {
    Logger.activeCategories = categories.length ? categories : ALL_CATEGORIES;
  }

  category: LogCategory;

  constructor(category: LogCategory) {
    this.category = category;
    this.timers = {};
  }

  #getDuraction(start: number | undefined) {
    return start ? `${Math.round(performance.now() - start)} ms` : "??  ms";
  }

  setActiveCategories(categories: LogCategory[]) {
    Logger.activeCategories = categories;
  }

  log(msg: string, ...extra: (Record<string, unknown> | string)[]) {
    if (Logger.activeCategories.includes(this.category)) {
      console.info(`[${this.category}]`, msg, ...extra);
    }
  }

  error(msg: string, ...extra: (Record<string, unknown> | string)[]) {
    console.error(`[${this.category}]`, msg, ...extra);
  }

  wrap<T extends Array<unknown>, U>(name: string, func: (...args: T) => U) {
    return (...args: T): U => {
      try {
        const result = func(...args);
        this.log(name + "()", { args, result });
        return result;
      } catch (e) {
        this.log(name + "()", { args });
        throw e;
      }
    };
  }

  duration<T extends Array<unknown>, U>(name: string, func: (...args: T) => U) {
    return (...args: T): U => {
      const start = performance.now();
      const result = func(...args);

      if (R.isPromise(result)) {
        void result.then(() =>
          this.log(name + "()", `${Math.round(performance.now() - start)} ms`)
        );
      } else {
        this.log(name + "()", `${Math.round(performance.now() - start)} ms`);
      }
      return result;
    };
  }

  time(name: string) {
    this.log(name, "Start");
    this.timers[name] = performance.now();
  }

  timeEnd(name: string) {
    this.log(name, this.#getDuraction(this.timers[name]));
    delete this.timers[name];
  }
}

export default Logger;

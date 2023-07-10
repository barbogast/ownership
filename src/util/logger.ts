const ALL_CATEGORIES = [
  "transform",
  "sql",
  "database",
  "git",
  "fs",
  "csv",
] as const;
type LogCategory = (typeof ALL_CATEGORIES)[number];

class Logger {
  static activeCategories: readonly LogCategory[] = [];

  static enable(...categories: LogCategory[]) {
    Logger.activeCategories = categories.length ? categories : ALL_CATEGORIES;
  }

  category: LogCategory;

  constructor(category: LogCategory) {
    this.category = category;
  }

  setActiveCategories(categories: LogCategory[]) {
    Logger.activeCategories = categories;
  }

  log(msg: string, extra?: Record<string, unknown> | string) {
    if (Logger.activeCategories.includes(this.category)) {
      console.info(`[${this.category}]`, msg, extra);
    }
  }

  wrap<T extends Array<unknown>, U>(name: string, func: (...args: T) => U) {
    return (...args: T): U => {
      const result = func(...args);
      this.log(name + "()", { args, result });
      return result;
    };
  }

  time<T extends Array<unknown>, U>(name: string, func: (...args: T) => U) {
    return (...args: T): U => {
      const start = performance.now();
      const result = func(...args);
      const end = performance.now();
      this.log(name + "()", `${Math.round(end - start)} ms`);
      return result;
    };
  }
}

export default Logger;

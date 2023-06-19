export const logger = (
  category: "sql" | "database",
  msg: string,
  extra?: Record<string, unknown>
) => {
  console.info(`[${category}]`, msg, extra);
};

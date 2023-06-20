export const logger = (
  category: "sql" | "database",
  msg: string,
  extra?: Record<string, unknown>
) => {
  console.info(`[${category}]`, msg, extra);
};

export const downloadFile = (
  data: BlobPart,
  mimeType: string,
  fileName: string
) => {
  // https://stackoverflow.com/a/37340749
  const blob = new Blob([data], { type: mimeType });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

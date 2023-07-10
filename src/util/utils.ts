import { useLocation } from "wouter";
import { COLORS } from "../constants";
import { RepositoryInfo } from "../types";

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

export const deepCopy = <T extends Record<string, unknown>>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const getColor = (index: number) => {
  return COLORS[index % COLORS.length];
};

export const getPositionFromStacktrace = (stack: string) => {
  const line = stack
    .split("\n")
    .find((e) => e.includes("<anonymous>:") || e.includes("Function:"));

  if (!line) {
    return;
  }

  const re = line.includes("<anonymous>:")
    ? /<anonymous>:(\d+):(\d+)/
    : /Function:(\d+):(\d+)/;
  const result = re.exec(line);
  if (!result) {
    return;
  }
  return {
    line: parseInt(result[1]) - 2, // No idea but the browser seems to add 2 to the line number
    column: parseInt(result[2]),
  };
};

export const getRepoInfo = (
  organization: string,
  repository: string
): RepositoryInfo => ({
  organization,
  repository,
  path: `${organization}/${repository}`,
});

export const useRepoInfo = (): RepositoryInfo | undefined => {
  const [location] = useLocation();
  const [_, organization, repository] = location.split("/");
  if (!organization || !repository) {
    return;
  }
  return { organization, repository, path: `${organization}/${repository}` };
};

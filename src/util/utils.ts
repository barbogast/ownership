import { useLocation } from "wouter";
import { v4 as uuidv4 } from "uuid";

import { COLORS } from "../constants";
import { RepositoryInfo } from "../types";
import { useMemo } from "react";

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

  const info = useMemo(() => {
    if (!organization || !repository) {
      return;
    }

    return {
      organization,
      repository,
      path: `${organization}/${repository}`,
    };
  }, [organization, repository]);

  return info;
};

export const getBasePath = () => {
  const segments = location.pathname.split("/");
  return `/${segments[1]}/${segments[2]}`;
};

export const isPromise = <T>(value: unknown): value is Promise<T> =>
  typeof value === "object" && value !== null && "then" in value;

export const isObject = (obj: unknown): obj is Record<string, unknown> => {
  return typeof obj === "object" && obj !== null;
};

export const sortByLabel = (a: { label: string }, b: { label: string }) =>
  a.label.toLowerCase() > b.label.toLowerCase()
    ? 1
    : b.label.toLowerCase() > a.label.toLowerCase()
    ? -1
    : 0;

export const createId = uuidv4;

export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
) =>
  // https://stackoverflow.com/a/67074641
  Object.fromEntries(
    Object.entries(obj).filter((e) => !keys.includes(e[0] as K))
  );

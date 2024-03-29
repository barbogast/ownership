import { v4 as uuidv4 } from "uuid";

import { COLORS } from "../constants";

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

export const getColor = (index: number) => {
  return COLORS[index % COLORS.length];
};

export const getBasePath = () => {
  const segments = location.pathname.split("/");
  return `/${segments[1]}/${segments[2]}`;
};

export const sortByLabel = (a: { label: string }, b: { label: string }) =>
  a.label.toLowerCase() > b.label.toLowerCase()
    ? 1
    : b.label.toLowerCase() > a.label.toLowerCase()
    ? -1
    : 0;

export const createId = uuidv4;

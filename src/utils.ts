import { COLORS } from "./constants";

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

export const deepCopy = <T extends Record<string, unknown>>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const splitLabel = (
  label: string
): [string | undefined, number | undefined] => {
  const re = new RegExp(`^(.+?)( \\((\\d+)\\))?$`);
  const match = re.exec(label);
  if (!match) {
    return [undefined, undefined];
  }
  return [match[1], match[3] ? parseInt(match[3]) : undefined];
};

// Returns the label appended with " (1)" if there already is a query with the same
// label, like "My Query (1)"
// If there already are queries with a number appended, the returned number will be
// incremented.
export const getNewLabel = (existingLabels: string[], oldLabel: string) => {
  const [oldLabelBase, oldLabelNumber] = splitLabel(oldLabel);
  let sameLabelFound = false;
  const existingNumbers = [];
  for (const existingLabel of existingLabels) {
    const [base, number] = splitLabel(existingLabel);
    if (base === oldLabelBase) {
      sameLabelFound = true;
      if (number) {
        existingNumbers.push(number);
      }
    }
  }

  if (sameLabelFound) {
    const newNumber = existingNumbers.length
      ? Math.max(...existingNumbers) + 1
      : 1;
    return newNumber !== oldLabelNumber
      ? `${oldLabelBase} (${newNumber})`
      : oldLabel;
  } else {
    return oldLabel;
  }
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

export const getBasePath = () => {
  const [_, organization, repository] = window.location.pathname.split("/");
  console.log({ organization, repository });
  return `/${organization}/${repository}`;
};

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
  console.log(COLORS[COLORS.length % index], index, COLORS.length % index);
  return COLORS[index % COLORS.length];
};

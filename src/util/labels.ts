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

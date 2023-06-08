import fs from "fs";

import { parse } from "csv-parse/sync";

const input = fs.readFileSync(
  "202004_Bruegel_sovereign_bond_-holding_dataset2 - BELGIUM.csv",
  "utf-8"
);
const records = parse(input) as string[][];

const columnIsEmpty = (records: string[][], index: number) => {
  for (const row of records) {
    if (row[index] !== "") {
      return false;
    }
  }
  return true;
};

const firstEmptyColumn = () => {
  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (columnIsEmpty(records, i)) {
      break;
    }
    i++;
  }
  return i;
};

const rowIsEmpty = (row: string[], columnLimit: number) => {
  for (const cell of row.slice(0, columnLimit)) {
    if (cell !== "") {
      return false;
    }
  }
  return true;
};

const firstEmptyRow = (columnLimit: number) => {
  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (rowIsEmpty(records[i], columnLimit)) {
      break;
    }
    i++;
  }
  return i;
};

// The sheet contains 2 blocks of data. We are only interested in the first one
const lastDataColumn = firstEmptyColumn();

const lastHeaderRow = firstEmptyRow(lastDataColumn) - 1;

// Headers are spread over multiple rows.
// In some columns there are multiple rows which contain values. In this case the actual
// header is in the lowest row.
// For now we just search for headers and remember row and column indices of each header.
const headerRows = records.slice(0, lastHeaderRow + 1);
type Header = { row: number; column: number; text: string };
const headers: Header[] = [];
for (const [rowIndex, row] of headerRows.entries()) {
  for (const [columnIndex, cell] of row.slice(0, lastDataColumn).entries()) {
    if (cell !== "") {
      headers[columnIndex] = { row: rowIndex, column: columnIndex, text: cell };
    }
  }
}

// The header of the first column is not in the sheet, so we fix it manually
headers[0].text = "Year";

type Entry = {
  name: string;
  value: string;
  children: Entry[];
  key: string;
  parent: Entry | undefined;
};

const result: Entry[] = [];
let counter = 0;

for (const row of records.slice(lastHeaderRow)) {
  if (rowIsEmpty(row, lastDataColumn)) {
    // Skip empty rows until the data part starts
    continue;
  }

  if (row[0] === "") {
    // Skip footer rows
    continue;
  }

  let currentParent: Entry | undefined;
  let previousEntry: Entry | undefined = undefined;
  for (const [columnIndex, cell] of row.slice(0, lastDataColumn).entries()) {
    const currentHeader = headers[columnIndex];
    const entry = {
      name: currentHeader.text,
      value: cell,
      children: [],
      key: String(counter),
      parent: currentParent,
    };

    if (columnIndex === 0) {
      result.push(entry);
      currentParent = entry;
    } else {
      const previousHeader = headers[columnIndex - 1];
      if (currentHeader.row > previousHeader.row) {
        // The current value needs to be a child of the previous cell
        currentParent = previousEntry;
      } else if (currentHeader.row < previousHeader.row) {
        // The current value is above the previous
        currentParent = currentParent!.parent;
      }
      entry.parent = currentParent;

      currentParent!.children?.push(entry);
    }

    previousEntry = entry;
    counter++;
  }
}

type EntryWithoutParent = {
  name: string;
  value: string;
  children?: EntryWithoutParent[];
  key: string;
};

// Remove 'parent' property and 'children' property if empty
const cleanupResult = ({
  parent,
  children,
  ...entry
}: Entry): EntryWithoutParent => ({
  ...entry,
  ...(children.length ? { children: children.map(cleanupResult) } : {}),
});

fs.writeFileSync(
  "data.json",
  JSON.stringify(result.map(cleanupResult), null, 2),
  "utf-8"
);

import fs from "fs";

import { parse } from "csv-parse/sync";

/*
This CSV:
--------------------------------------------------------------------------------------
Country	  Time	  Total 	  Total         Total           Total         Total
                            Residents	    Residents       Residents     Non-residents
                                          Central bank    OMFIs
Greece    1995    100       55            35              20            35
--------------------------------------------------------------------------------------

will become this database table

--------------------------------------------------------------------------------------
country   time    category_1    category_2    category_3    value
greece    1995    Total         Residents     Central bank  35
greece    1995    Total         Residents     OMFIs         20
greece    1995    Total         Non-residents NULL          45
--------------------------------------------------------------------------------------

Explanation: 
In a row, each value which is not of a sum of other values results in a separate DB entry.
For this example this means that 3rd and the 4th column of the CSV are dropped, since they
can be derived by adding other columns.

Example queries for the resulting DB schema

Reconstruct the 3rd colunn (Total): 
  SELECT * from table where time = 1995 and country = 'greece';

Reconstruct the 4th column (Residents):
  SELECT * from table where time = 1995 and country = 'greece' and category_2 = 'residents';
*/

// This is the number of columns counting from the left which should be
// copied into the output csv unchanged
const NUMBER_OF_STATIC_COLUMNS = 2;

// Calculate the header with the most levels by splitting each header by \n and taking the highest length
const getNumberOfCategories = (valueHeaders: string[]) =>
  Math.max(...valueHeaders.map((header) => header.split("\n").length));

const getColumnIndicesToDrop = (
  valueHeaders: string[],
  staticHeaders: string[]
) => {
  // We need to drop all columnns which are just sums of other columns
  const columnIndecesToDrop: (boolean | undefined)[] = [];
  for (const header of valueHeaders) {
    const categories = header.split("\n");
    const parentCategories = categories.slice(0, -1);

    const indexOfParent = valueHeaders.indexOf(parentCategories.join("\n"));
    if (indexOfParent !== -1) {
      columnIndecesToDrop[indexOfParent] = true;
    }
  }

  const info = columnIndecesToDrop.reduce((acc, current, index) => {
    if (current) {
      acc[index + 1 + staticHeaders.length] = valueHeaders[index];
    }
    return acc;
  }, {} as Record<number, string>);
  console.log(`The following columns have been dropped (index: header):`, info);

  return columnIndecesToDrop;
};

const getNewHeaders = (numberOfCategories: number, staticHeaders: string[]) => {
  const newHeaders = ([] as string[]).concat(staticHeaders);
  for (let i = 0; i < numberOfCategories; i++) {
    newHeaders.push(`category_${i + 1}`);
  }
  newHeaders.push("value");
  return newHeaders;
};

const writeCsv = (result: string[][]) => {
  fs.writeFileSync(
    "output.csv",
    result
      .map((row) => row.map((v) => (v === undefined ? '""' : v)).join("\t"))
      .join("\n"),
    "utf-8"
  );
};

const processFile = (
  result: string[][],
  fileName: string,
  addHeader: boolean
) => {
  console.log("Processing", fileName);
  const input = fs.readFileSync(`csv/${fileName}`, "utf-8");

  // Windows and old Macos versions use \r\n as line separator. Let's remove \r to not get confused
  const cleaned = input.replace(/\r/g, "");

  const records = parse(cleaned, { delimiter: "," }) as string[][];

  const [headerRow, ...valueRows] = records;

  const staticHeaders = headerRow.slice(0, NUMBER_OF_STATIC_COLUMNS);
  const valueHeaders = headerRow.slice(NUMBER_OF_STATIC_COLUMNS);

  const numberOfCategories = getNumberOfCategories(valueHeaders);

  // We need to drop all columnns which are just sums of other columns
  const columnIndecesToDrop = getColumnIndicesToDrop(
    valueHeaders,
    staticHeaders
  );

  if (addHeader) {
    result.push(getNewHeaders(numberOfCategories, staticHeaders));
  }

  for (const [country, year, ...values] of valueRows) {
    for (const [index, value] of values.entries()) {
      if (columnIndecesToDrop[index]) {
        continue;
      }
      const header = valueHeaders[index];
      const categories = header.split("\n");

      const entry = [country, year];
      for (let i = 0; i < numberOfCategories; i++) {
        entry.push(categories[i]);
      }

      entry.push(value);
      result.push(entry);
    }
  }
};

const result: string[][] = [];
processFile(result, "finnland.csv", true);
processFile(result, "belgium.csv", false);
writeCsv(result);
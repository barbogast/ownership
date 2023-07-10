import { Query, getDefaults } from "./queryStore";

const code1 = `
type Value = string | number | null
type QueryResult = {values: Value[][], colums: string[]}[]
type TransformResult = Record<string, Value>[]

function transform(queryResult: QueryResult): TransformResult{
  return queryResult[0].values.map((row) => {
    const mappedValues = Object.fromEntries(queryResult[0].columns.map((k, i) => [k, row[i]]));
    return {
      name: "Year",
      value: mappedValues.year,
      children: [
        {
          name: "Total",
          value: mappedValues.total,
          children: [
            {
              name: "Residents",
              value: mappedValues.residents,
              children: [
                { name: "Central Bank", value: mappedValues.central_bank },
                { name: "OMFIs", value: mappedValues.omfis },
                { name: "Other financial institutions", value: mappedValues.other_financial_institutions },
                { name: "Other Residents", value: mappedValues.other_residents },
              ],
            },
            { name: "Non-Residents", value: mappedValues.non_residents },
          ],
        },
      ],
    };
  });
}`;

const query = `
select category_1 from aaa where category_1 is not null group by category_1 order by category_1;
select category_2 from aaa where category_2 is not null group by category_2 order by category_2;
select category_3 from aaa where category_3 is not null group by category_3 order by category_3;
select category_4 from aaa where category_4 is not null group by category_4  order by category_4;`;

const code2 = `
type Value = string | number | null
type QueryResult = {values: Value[][], colums: string[]}[]
type TransformResult = Record<string, Value>[]

function transform(queryResult: QueryResult): TransformResult{
  const valueArrays = queryResult.map(({values}) => values)
  const [cat1, cat2, cat3, cat4] = queryResult.map(res => res.values.map(row => row[0]))


  const maxLength = Math.max(...valueArrays.map(arr => arr.length))


  const data = Array(maxLength).fill(null).map((_, i) => ({
    category1: cat1[i],
    category2: cat2[i],
    category3: cat3[i],
    category4: cat4[i]
  }))
  return data
}
`;

const getQueryTestData = () =>
  ({
    tableofownershipdetails: {
      ...getDefaults(),
      id: "tableofownershipdetails",
      label: "Debt ownership: Details",
      databaseFileName: "database.sqlite",
      sqlStatement: "select * from aaa",
      transformType: "code",
      transformCode: code1,
      chartType: "table",
    },
    tableofownershipdistribution: {
      ...getDefaults(),
      id: "tableofownershipdistribution",
      label: "Debt ownership: Distribution",
      databaseFileName: "database.sqlite",
      sqlStatement:
        "select central_bank, omfis, other_financial_institutions, other_residents from aaa",
      transformCode: "",
      chartType: "pieChart",
    },
    tableofownershiptime: {
      ...getDefaults(),
      id: "tableofownershiptime",
      label: "Debt ownership: Time",
      databaseFileName: "database.sqlite",
      sqlStatement:
        "select central_bank, omfis, other_financial_institutions, other_residents from aaa",
      transformCode: "",
      chartType: "barChart",
    },
    categoryanalysis: {
      ...getDefaults(),
      id: "categoryanalysis",
      label: "Category Analysis",
      databaseFileName: "database2.sqlite",
      sqlStatement: query,
      transformCode: code2,
      transformType: "code",
      chartType: "table",
    },
  } as Record<string, Query>);

export default getQueryTestData;

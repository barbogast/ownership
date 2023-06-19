import React, { Fragment, useMemo, useState } from "react";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { Database, QueryExecResult } from "../Db";
import QueryResult from "./QueryResult";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDatabase } from "../dbStore";

const log = (msg: string, category: "sql") => {
  console.log(category, ": ", msg);
};

const DEBUG = true;
const initialValues = DEBUG
  ? {
      csv: `Year	TOTAL	Residents	Central bank	OMFIs	Other financial institutions	Other residents	Non-residents
1995	276344	211032	2217	158189	30667	19960	65311
1996	276440	215048	2318	160798	32361	19573	61392
1997	278493	213717	2418	157935	34137	19226	64776
1998	277255	206658	2487	154526	27987	21657	70597
1999	279531	193889	2997	140213	30541	20138	85642
2000	280960	173341	3095	121906	28403	19937	107618
2001	286055	164094	3047	113210	27694	20143	121962
2002	288111	152388	2865	103693	26023	19807	135722
2003	285867	145146	2863	98627	24985	18671	140721
2004	288419	143936	2853	95650	26122	19311	144482
2005	294975	144219	3220	94113	27510	19376	150757
2006	297495	142840	3459	92208	28819	18353	154655
2007	300064	128375	4584	77186	28857	17747	171689
2008	327683	136614	4891	80039	32836	18849	191069
2009	347224	153875	5163	85293	43801	19618	193349
2010	364132	167381	6319	92237	49635	19190	196752
2011	389107	208678	7437	105518	70343	25379	180429
2012	404752	217575	8365	108511	77634	23066	187177
2013	414432	210662	8320	103447	76035	22860	203771
2014	431159	197043	7059	91137	77634	21213	234116
2015	438233	204026	19161	88138	75230	21497	234207
2016	451327	209180	37252	82127	70726	19076	242147
2017	453828	218752	55468	76121	69445	17718	235076
2018	459061	215577	59848	71650	66560	17519	243484
2019	467160	206880	59922	64496	65638	16823	260280`,
      tableName: "aaa",
      query: "select * from aaa",
      //select central_bank, omfis, other_financial_institutions, other_residents from aaa where year = 1995
    }
  : {
      csv: "",
      tableName: "",
      query: "",
    };

const guessType = (rows: string[][], headerIndex: number) => {
  const value = rows[1][headerIndex];
  if (String(parseInt(value)) === value) {
    return "integer";
  }

  const maybeFloat = value.replace(",", "."); // Fix decimal separator
  if (
    String(parseFloat(maybeFloat)) ===
    // parseFloat(111.0) will result in "111"
    maybeFloat.replace(".0", "")
  ) {
    return "real";
  }

  return "text";
};

type ColumnType = "integer" | "real" | "text";

type ColumnDefinition = {
  csvName: string;
  dbName: string;
  csvIndex: number;
  type: "integer" | "real" | "text";
};

const analyzeCsvHeader = (csvText: string): ColumnDefinition[] => {
  const rows = csvText.split("\n").map((row) => row.split("\t"));

  const columns = rows[0].map(
    (name, index) =>
      ({
        csvName: name,
        dbName: slugify(name, "_").toLowerCase().replace("-", "_"),
        csvIndex: index,
        type: guessType(rows, index),
      } as const)
  );
  return columns;
};

const colors = [
  "yellow",
  "red",
  "blue",
  "green",
  "black",
  "grey",
  "purple",
  "orange",
];

const createTable = (
  db: Database,
  tableName: string,
  columns: ColumnDefinition[]
) => {
  const createTableStatement = `
    create table ${tableName} (${columns.map(
    (col) => `${col.dbName} ${col.type}`
  )})`;
  log(createTableStatement, "sql");
  db.exec(createTableStatement);
};

const insertIntoTable = (
  db: Database,
  tableName: string,
  columns: ColumnDefinition[],
  csvText: string
) => {
  const rows = csvText.split("\n").map((row) => row.split("\t"));
  for (const row of rows.slice(1)) {
    const insertStmt = `insert into ${tableName} (${columns.map(
      (col) => col.dbName
    )}) values (${row.join(", ")})`;
    log(insertStmt, "sql");
    db?.exec(insertStmt);
  }
};

type Progress = {
  parsed?: boolean;
  imported?: boolean;
  queried?: boolean;
};

type ChartType = "barChart" | "pieChart";

const CsvImport: React.FC = () => {
  const id = useMemo(uuidv4, []);
  const db = useDatabase(id, false);
  const [progress, setProgress] = useState<Progress>({});
  const [csvText, setCsvText] = useState(initialValues.csv);
  const [tableName, setTableName] = useState(initialValues.tableName);
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [query, setQuery] = useState(initialValues.query);
  const [chartType, setChartType] = useState<ChartType>("barChart");

  const [queryResult, setQueryResult] = useState<QueryExecResult[]>([]);
  const [error, setError] = useState<Error>();

  const parseCsv = () => {
    try {
      setError(undefined);
      setColumns(analyzeCsvHeader(csvText));
      setProgress({ parsed: true });
    } catch (err) {
      setError(err as Error);
    }
  };

  const insertTable = () => {
    if (db.status !== "loaded") throw new Error();
    try {
      setError(undefined);
      createTable(db.db, tableName, columns);
      insertIntoTable(db.db, tableName, columns, csvText);
      setProgress({ parsed: true, imported: true });
    } catch (err) {
      setError(err as Error);
    }
  };

  const runQuery = () => {
    if (db.status !== "loaded") throw new Error();
    try {
      setError(undefined);
      setQueryResult(db.db.exec(query));
      setProgress({ parsed: true, imported: true, queried: true });
    } catch (err) {
      setError(err as Error);
      setQueryResult([]);
    }
  };

  console.log(queryResult);

  return (
    <div style={{ display: "block", flexDirection: "column" }}>
      <textarea
        value={csvText}
        onChange={(event) => setCsvText(event.target.value)}
        style={{ width: "100%", height: "500px" }}
      />
      <br />
      <button onClick={parseCsv}>Parse</button>
      <br />
      <br />
      {progress.parsed && (
        <>
          Table name:{" "}
          <input
            value={tableName}
            onChange={(event) => setTableName(event.target.value)}
          />
          <br />
          {columns.map((col, i) => (
            <Fragment key={col.dbName + i}>
              {col.csvName}
              <input
                value={col.dbName}
                onChange={(event) => {
                  col.dbName = event.target.value;
                }}
              />
              <select
                value={col.type}
                onChange={(event) => {
                  col.type = event.target.value as ColumnType;
                }}
              >
                <option value="integer">Integer</option>
                <option value="real">Real</option>
                <option value="text">Text</option>
              </select>
              <br />
            </Fragment>
          ))}
          <button onClick={insertTable}>Import into DB</button>
          <br />
        </>
      )}
      {progress.imported && (
        <>
          Query:{" "}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ width: 500 }}
          />
          <button onClick={runQuery}>Run query</button>
          {queryResult && (
            <pre>
              {
                // results contains one object per select statement in the query
                queryResult.map(({ columns, values }, i) => (
                  <QueryResult key={i} columns={columns} values={values} />
                ))
              }
            </pre>
          )}
        </>
      )}
      {progress.queried && (
        <>
          <select
            value={chartType}
            onChange={(event) => setChartType(event.target.value as ChartType)}
          >
            <option value="barChart">Bar chart</option>
            <option value="pieChart">Pie chart</option>
          </select>
          {chartType === "barChart" &&
            queryResult.map(({ columns, values }) => (
              <BarChart
                width={500}
                height={300}
                data={values.map((row) =>
                  columns.slice(1).reduce(
                    (data, col, index) => ({
                      ...data,
                      [col]: row[index],
                      name: row[0],
                    }),
                    {}
                  )
                )}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {columns.map((col, i) => (
                  <Bar
                    dataKey={col}
                    stackId="a"
                    fill={colors[i % colors.length]}
                  />
                ))}
              </BarChart>
            ))}

          {chartType === "pieChart" &&
            queryResult.map(({ columns, values }) => (
              <PieChart width={600} height={400}>
                <Pie
                  data={values[0].map((value, i) => ({
                    name: "xxx" + i,
                    key: i,
                    value: value,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 1.4;
                    const RADIAN = Math.PI / 180;

                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                      >
                        {columns[index] + ": " + value}
                      </text>
                    );
                  }}
                >
                  {values.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            ))}
        </>
      )}
      <pre style={{ color: "red" }}>{(error || "").toString()}</pre>;
    </div>
  );
};

export default CsvImport;

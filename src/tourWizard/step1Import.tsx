import imageCsv from "./images/csv.png";
import imageCode from "./images/code.png";
import { Step } from "../components/wizard/types";
import { StepName, Result } from "./types";
import TourImage from "./TourImage";

// Example code for screenshot
/*
Year	TOTAL	Residents	Central bank	OMFIs	Other financial institutions	Other residents	Non-residents
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
2019	467160	206880	59922	64496	65638	16823	260280
*/

// Example code for screenshot
/*
type Value = string | number | null | undefined
type Row = Record<string, Value>
type Columns = { name: string, type: "text" | "integer" | "real" }[]
type ReturnValue = {data: Row[], columns: Columns}

async function execute(): Promise<ReturnValue> {
  const res = await fetch('https://yourwebsite.com/api/v1/weather')
  const data = await res.json()

  const preparedData = data.map(row => ({tempCelsius: (row.tempFahrenheit - 32) * 5 / 9, date: row.date}))
  return {data: preparedData, columns: [{name: 'tempCelsius', type: 'real'}, {name: 'date', type: 'text'}]}
}
*/

const getStep = () => {
  const step: Step<StepName, Result> = {
    type: "component",
    label: "1. Import",
    nextStep: "stepQuery",
    component: () => (
      <div>
        Populate your database with data from a csv file or a JSON file...
        <TourImage src={imageCsv} />
        ... or write a script to generate the data, for example by fetching it
        from a third-party API.
        <TourImage src={imageCode} />
      </div>
    ),
  };

  return step;
};

export default getStep;

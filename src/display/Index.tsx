import { useQuery } from "../query/queryStore";
import TableDisplay from "./TableDisplay";
import BarChartDisplay from "./BarChartDisplay";
import PieChartDisplay from "./PieChartDisplay";
import LineChartDisplay from "./LineChartDisplay";
import { ChartProps, TransformResult } from "../types";
import StackedBarChart from "./StackedBarChartDisplay";
import StackedPieChart from "./StackedPieChartDisplay";
import { extractSingleDataset } from "../util/transform";

export type ChartType =
  | "table"
  | "barChart"
  | "stackedBarChart"
  | "pieChart"
  | "stackedPieChart"
  | "lineChart";

type Props = {
  queryId: string;
  transformResult: TransformResult;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SINGLE_DATASET_CHART_TYPES: ChartType[] = ["barChart", "pieChart"];

const chartComponents: Record<ChartType, React.FC<ChartProps>> = {
  barChart: BarChartDisplay,
  stackedBarChart: StackedBarChart,
  pieChart: PieChartDisplay,
  stackedPieChart: StackedPieChart,
  lineChart: LineChartDisplay,
  table: TableDisplay,
};

const ChartDisplay: React.FC<Props> = ({ queryId, transformResult }) => {
  const { chartType, transformConfig } = useQuery(queryId);

  const { labelColumn, dataRowIndex, dataOrientation } = transformConfig;
  const ChartComponent = chartType ? chartComponents[chartType] : undefined;

  const tranformResult2 =
    chartType &&
    SINGLE_DATASET_CHART_TYPES.includes(chartType) &&
    dataRowIndex !== undefined
      ? extractSingleDataset(
          transformResult,
          dataRowIndex,
          dataOrientation === "row" ? "label" : labelColumn
        )
      : transformResult;

  return (
    <>
      {tranformResult2.length
        ? ChartComponent && (
            <ChartComponent
              transformConfig={transformConfig}
              transformResult={tranformResult2}
            />
          )
        : null}
    </>
  );
};

export default ChartDisplay;

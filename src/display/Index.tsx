import { Query } from "../query/queryStore";
import TableDisplay from "./TableDisplay";
import BarChartDisplay from "./BarChartDisplay";
import PieChartDisplay from "./PieChartDisplay";
import LineChartDisplay from "./LineChartDisplay";
import { ChartProps, TransformResult } from "../types";
import StackedBarChart from "./StackedBarChartDisplay";
import StackedPieChart from "./StackedPieChartDisplay";
import { objectToArray } from "../util/transform";

export type ChartType =
  | "table"
  | "barChart"
  | "stackedBarChart"
  | "pieChart"
  | "stackedPieChart"
  | "lineChart";

type Props = {
  query: Query;
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

const ChartDisplay: React.FC<Props> = ({ query, transformResult }) => {
  if (!query.chartType) {
    return null;
  }
  const ChartComponent = chartComponents[query.chartType];

  const transformResult2 = SINGLE_DATASET_CHART_TYPES.includes(query.chartType!)
    ? objectToArray(transformResult, query.transformConfig.dataRowIndex)
    : transformResult;

  return (
    <>
      {transformResult2.length
        ? ChartComponent && (
            <ChartComponent
              transformConfig={query.transformConfig}
              transformResult={transformResult2}
            />
          )
        : null}
    </>
  );
};

export default ChartDisplay;

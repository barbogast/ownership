import { useQuery } from "../query/queryStore";
import TableDisplay from "./TableDisplay";
import BarChartDisplay from "./BarChartDisplay";
import PieChartDisplay from "./PieChartDisplay";
import LineChartDisplay from "./LineChartDisplay";
import { ChartProps, TransformResult } from "../types";
import StackedBarChart from "./StackedBarChartDisplay";
import StackedPieChart from "./StackedPieChartDisplay";
import { transform2 } from "../util/transform";

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
  const query = useQuery(queryId);

  if (!query.chartType) {
    return null;
  }
  const ChartComponent = chartComponents[query.chartType];

  const tranformResult2 = transform2(transformResult, query);

  return (
    <>
      {tranformResult2.length
        ? ChartComponent && (
            <ChartComponent
              transformConfig={query.transformConfig}
              transformResult={tranformResult2}
            />
          )
        : null}
    </>
  );
};

export default ChartDisplay;

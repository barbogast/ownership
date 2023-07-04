import {
  ChartType,
  SINGLE_DATASET_CHART_TYPES,
  useQuery,
} from "../query/queryStore";
import TableDisplay from "./TableDisplay";
import BarChartDisplay from "./BarChartDisplay";
import PieChartDisplay from "./PieChartDisplay";
import LineChartDisplay from "./LineChartDisplay";
import { ChartProps, TransformResult } from "../types";
import StackedBarChart from "./StackedBarChartDisplay";
import StackedPieChart from "./StackedPieChartDisplay";
import { extractSingleDataset } from "../transform";

type Props = {
  queryId: string;
  postProcessResult: TransformResult;
};

const chartComponents: Record<ChartType, React.FC<ChartProps>> = {
  barChart: BarChartDisplay,
  stackedBarChart: StackedBarChart,
  pieChart: PieChartDisplay,
  stackedPieChart: StackedPieChart,
  lineChart: LineChartDisplay,
  table: TableDisplay,
};

const ChartDisplay: React.FC<Props> = ({ queryId, postProcessResult }) => {
  const { chartType, transformConfig } = useQuery(queryId);

  const { labelColumn, dataRowIndex, dataOrientation } = transformConfig;
  const ChartComponent = chartType ? chartComponents[chartType] : undefined;

  const postProcessResult2 =
    chartType &&
    SINGLE_DATASET_CHART_TYPES.includes(chartType) &&
    dataRowIndex !== undefined
      ? extractSingleDataset(
          postProcessResult,
          dataRowIndex,
          dataOrientation === "row" ? "label" : labelColumn
        )
      : postProcessResult;

  return (
    <>
      {postProcessResult2.length
        ? ChartComponent && (
            <ChartComponent
              transformConfig={transformConfig}
              transformResult={postProcessResult2}
            />
          )
        : null}
    </>
  );
};

export default ChartDisplay;

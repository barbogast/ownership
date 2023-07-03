import { Select } from "antd";
import useQueryStore, {
  ChartType,
  SINGLE_DATASET_CHART_TYPES,
  updateChartType,
  useQuery,
} from "../queryStore";
import TableDisplay from "../../display/TableDisplay";
import BarChartDisplay from "../../display/BarChartDisplay";
import PieChartDisplay from "../../display/PieChartDisplay";
import LineChartDisplay from "../../display/LineChartDisplay";
import { ChartProps, TransformResult } from "../../types";
import StackedBarChart from "../../display/StackedBarChartDisplay";
import StackedPieChart from "../../display/StackedPieChartDisplay";
import { extractSingleDataset } from "../../transform";

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

const DisplaySection: React.FC<Props> = ({ queryId, postProcessResult }) => {
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
      <Select
        value={chartType}
        onChange={(value) => updateChartType(queryId, value)}
        options={[
          { value: "barChart", label: "Bar chart" },
          { value: "stackedBarChart", label: "Stacked Bar chart" },
          { value: "pieChart", label: "Pie chart" },
          { value: "stackedPieChart", label: "Stacked Pie chart" },
          { value: "lineChart", label: "Line chart" },
          { value: "table", label: "Table" },
        ]}
        style={{ width: 200 }}
      />
      <br />
      {(chartType === "barChart" || chartType === "pieChart") &&
        postProcessResult.length > 1 && (
          <>
            <br />
            Row to display:{" "}
            <Select
              value={dataRowIndex}
              onChange={(value) => {
                useQueryStore.setState((state) => {
                  state.queries[queryId].transformConfig.dataRowIndex = value;
                });
              }}
              options={postProcessResult.map((row, i) => ({
                value: i,
                label: `Row ${i + 1}: "${row[labelColumn]}"`,
              }))}
              style={{ width: 220 }}
            />
          </>
        )}
      <br />
      <br />

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

export default DisplaySection;

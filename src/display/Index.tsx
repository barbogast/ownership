import { Query, TransformConfig } from "../query/queryStore";
import TableDisplay from "./TableDisplay";
import BarChartDisplay from "./BarChartDisplay";
import PieChartDisplay from "./PieChartDisplay";
import LineChartDisplay from "./LineChartDisplay";
import { TransformResult } from "../types";
import StackedBarChart from "./StackedBarChartDisplay";
import StackedPieChart from "./StackedPieChartDisplay";
import { objectToArray } from "../util/transform";
import TimeSeriesDaysDisplay from "./TimeSeriesDaysDisplay";
import Logger from "../util/logger";
import VegaChart from "./VegaChart";
import { ReactElement } from "react";

const logger = new Logger("chart");

export type VegaChartProps = {
  chartType: "vegaChart";
  vegaSpec: string;
};

export type ChartConfig =
  | {
      chartType:
        | "table"
        | "barChart"
        | "stackedBarChart"
        | "pieChart"
        | "stackedPieChart"
        | "lineChart"
        | "timeSeriesDayChart";
    }
  | VegaChartProps;

type Props = {
  query: Query;
  transformResult: TransformResult;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SINGLE_DATASET_CHART_TYPES: ChartConfig["chartType"][] = [
  "barChart",
  "pieChart",
];

// Extra function so that TS complains if the switch statement is not exhaustive
const renderChart = (
  chartConfig: ChartConfig,
  transformResult: TransformResult,
  transformConfig: TransformConfig,
  queryId: string
): ReactElement => {
  switch (chartConfig.chartType) {
    case "barChart":
      return (
        <BarChartDisplay
          transformResult={transformResult}
          transformConfig={transformConfig}
          chartConfig={chartConfig}
          queryId={queryId}
        />
      );

    case "stackedBarChart":
      return (
        <StackedBarChart
          transformResult={transformResult}
          transformConfig={transformConfig}
        />
      );

    case "pieChart":
      return (
        <PieChartDisplay
          transformResult={transformResult}
          transformConfig={transformConfig}
        />
      );

    case "stackedPieChart":
      return (
        <StackedPieChart
          transformResult={transformResult}
          transformConfig={transformConfig}
        />
      );

    case "lineChart":
      return (
        <LineChartDisplay
          transformResult={transformResult}
          transformConfig={transformConfig}
        />
      );

    case "timeSeriesDayChart":
      return (
        <TimeSeriesDaysDisplay
          transformResult={transformResult}
          transformConfig={transformConfig}
        />
      );

    case "vegaChart":
      return (
        <VegaChart
          transformResult={transformResult}
          chartConfig={chartConfig}
          queryId={queryId}
        />
      );

    case "table":
      return <TableDisplay transformResult={transformResult} />;
  }
};

const ChartDisplay: React.FC<Props> = ({ query, transformResult }) => {
  const transformResult2 = SINGLE_DATASET_CHART_TYPES.includes(
    query.chartConfig.chartType
  )
    ? objectToArray(transformResult, query.transformConfig.dataRowIndex)
    : transformResult;

  if (!transformResult2.length) {
    return null;
  }

  logger.log("Render chart", query.chartConfig.chartType, {
    transformResult: transformResult2,
    transformConfig: query.transformConfig,
  });

  return (
    <div style={{ width: "100%", height: 500 }}>
      {renderChart(
        query.chartConfig,
        transformResult2,
        query.transformConfig,
        query.id
      )}
    </div>
  );
};

export default ChartDisplay;

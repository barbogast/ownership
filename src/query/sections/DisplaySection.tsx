import { Checkbox, Select } from "antd";

import { Query, updateTransformConfig, updateChartConfig } from "../queryStore";
import { TransformResult } from "../../types";
import ChartDisplay, { SINGLE_DATASET_CHART_TYPES } from "../../display/Index";

type Props = {
  query: Query;
  transformResult: TransformResult;
};

const DisplaySection: React.FC<Props> = ({ query, transformResult }) => {
  const { labelColumn, dataRowIndex, selectedColumns } = query.transformConfig;

  const firstTransformResult = transformResult[0];
  if (!firstTransformResult) {
    return null;
  }

  const selectedColumnOptions = Object.keys(firstTransformResult).filter(
    (col) => col !== labelColumn
  );

  return (
    <>
      <Select
        value={query.chartConfig?.chartType}
        onChange={(chartType) => updateChartConfig(query.id, { chartType })}
        options={[
          { value: "barChart", label: "Bar chart" },
          { value: "stackedBarChart", label: "Stacked Bar chart" },
          { value: "pieChart", label: "Pie chart" },
          { value: "stackedPieChart", label: "Stacked Pie chart" },
          { value: "lineChart", label: "Line chart" },
          { value: "timeSeriesDayChart", label: "Time series day chart" },
          { value: "vegaChart", label: "Vega Chart" },
          { value: "table", label: "Table" },
        ]}
        style={{ width: 200 }}
      />
      <br />
      {query.chartConfig?.chartType !== "vegaChart" && (
        <>
          Columns to display:
          <Checkbox.Group
            options={selectedColumnOptions}
            value={selectedColumns}
            onChange={(values) => {
              updateTransformConfig(query.id, {
                selectedColumns: values as string[],
              });
            }}
          />
          <br />
        </>
      )}
      <br />
      {query.chartConfig &&
        SINGLE_DATASET_CHART_TYPES.includes(query.chartConfig.chartType) &&
        transformResult.length > 1 && (
          <>
            <br />
            Row to display:{" "}
            <Select
              value={dataRowIndex}
              onChange={(value) =>
                updateTransformConfig(query.id, { dataRowIndex: value })
              }
              options={transformResult.map((row, i) => ({
                value: i,
                label:
                  `Row ${i + 1}` +
                  (labelColumn !== "--no-label-column--"
                    ? `: ${row[labelColumn]}`
                    : ""),
              }))}
              style={{ width: 220 }}
            />
          </>
        )}
      <br />
      <br />

      <ChartDisplay query={query} transformResult={transformResult} />
    </>
  );
};

export default DisplaySection;

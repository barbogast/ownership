import { Select } from "antd";
import useQueryStore, { updateChartType, useQuery } from "../queryStore";

import { TransformResult } from "../../types";

import ChartDisplay from "../../display/Index";

type Props = {
  queryId: string;
  postProcessResult: TransformResult;
};

const DisplaySection: React.FC<Props> = ({ queryId, postProcessResult }) => {
  const { chartType, transformConfig } = useQuery(queryId);

  const { labelColumn, dataRowIndex } = transformConfig;

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

      <ChartDisplay queryId={queryId} postProcessResult={postProcessResult} />
    </>
  );
};

export default DisplaySection;

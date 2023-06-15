import { Select } from "antd";
import { updateChartType, useQuery } from "../queryStore";
import { QueryExecResult } from "../../Db";
import { queryExecResultToObjects } from "../utils";
import TableDisplay from "../../display/TableDisplay";
import BarChartDisplay from "../../display/BarChartDisplay";
import PieChartDisplay from "../../display/PieChartDisplay";

type Props = {
  queryId: string;
  postProcessResult: never[];
  queryResults: QueryExecResult[];
};

const DisplaySection: React.FC<Props> = ({
  queryId,
  postProcessResult,
  queryResults,
}) => {
  const { chartType, transformCode } = useQuery(queryId);

  return (
    <>
      <Select
        value={chartType}
        onChange={(value) => updateChartType(queryId, value)}
        options={[
          { value: "barChart", label: "Bar chart" },
          { value: "pieChart", label: "Pie chart" },
          { value: "table", label: "Table" },
        ]}
        style={{ width: 120 }}
      />
      <br />
      <br />

      {chartType === "table" &&
        (transformCode ? (
          <TableDisplay
            columns={
              postProcessResult.length ? Object.keys(postProcessResult[0]) : []
            }
            values={postProcessResult}
          />
        ) : (
          queryResults.map((queryResult, i) => (
            <TableDisplay
              columns={queryResult.columns}
              values={queryExecResultToObjects(queryResult)}
              key={i}
            />
          ))
        ))}

      {chartType === "barChart" &&
        queryResults.map((queryResult, i) => (
          <BarChartDisplay queryResult={queryResult} key={i} />
        ))}

      {chartType === "pieChart" &&
        queryResults.map((queryResult, i) => (
          <PieChartDisplay queryResult={queryResult} key={i} />
        ))}
    </>
  );
};

export default DisplaySection;

import { Button } from "antd";
import useQueryStore from "./query/queryStore";
import getQueryTestData from "./testData/queries";
import useModifiedStore from "./modifiedStore";
import useReportStore from "./report/reportStore";
import getReportTestData from "./testData/reports";
import useDatabaseDefinitionStore from "./databaseDefinitionStore";
import getDatabasesTestData from "./testData/databases";

const DevTools: React.FC = () => {
  return (
    <Button
      onClick={() => {
        useModifiedStore.setState(() => ({ modifiedQueries: [] }));
        useDatabaseDefinitionStore.setState(() => getDatabasesTestData());
        useQueryStore.setState(() => getQueryTestData());
        useReportStore.setState(() => getReportTestData());
      }}
    >
      Load test data
    </Button>
  );
};

export default DevTools;

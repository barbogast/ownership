import React, { useEffect, useState } from "react";

import ReportComponent from "../src/report/Report";
import { Report } from "../src/report/reportStore";
import ReportDisplay from "./ReportDisplay";

const repoPath = "barbogast/ownership-test-repo";
const Chart: React.FC = () => {
  const [report, setReport] = useState<Report>();

  useEffect(() => {
    const run = async () => {
      console.log("ASDFASDF");
      const blockP = fetch(
        `https://raw.githubusercontent.com/${repoPath}/main/reports/888abb49-2912-4ba0-affb-22a0ede59a5e/blocks.json`
      ).then((res) => res.json());

      const reportP = fetch(
        `https://raw.githubusercontent.com/${repoPath}/main/reports/888abb49-2912-4ba0-affb-22a0ede59a5e/index.json`
      ).then((res) => res.json());

      const [blocks, report] = await Promise.all([blockP, reportP]);
      setReport({ ...report, blocks });
    };
    run();
  }, []);
  console.log("data", report);
  if (!report) {
    return;
  }

  return <ReportComponent report={report} displayComponent={ReportDisplay} />;
};

export default Chart;

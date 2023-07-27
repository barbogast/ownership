import React from "react";
import { useReport, Report } from "./report/reportStore";

type Props = {
  reportId: string;
  child: (report: Report) => JSX.Element;
};

const WithReportFromLocalStorage: React.FC<Props> = ({ child, reportId }) => {
  const report = useReport(reportId);
  if (!report) {
    return `Query with ID ${reportId} not found.`;
  }
  return child(report);
};

export default WithReportFromLocalStorage;

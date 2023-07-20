import React from "react";
import { useReport, Report } from "./report/reportStore";

type Props = {
  reportId: string;
  child: (report: Report) => JSX.Element;
};

const WithReportFromLocalStorage: React.FC<Props> = ({ child, reportId }) => {
  const report = useReport(reportId);
  return child(report);
};

export default WithReportFromLocalStorage;

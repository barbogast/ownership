import { Menu } from "antd";
import { ReactElement } from "react";
import { Link, useLocation } from "wouter";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import useQueryStore, {
  Query,
  addQuery,
  importQuery,
} from "./query/queryStore";
import useReportStore, { addReport } from "./report/reportStore";
import { databaseFiles } from "./constants";

type Props = {
  children?: ReactElement | ReactElement[] | null;
};
const MainMenu: React.FC<Props> = ({ children }) => {
  const queryStore = useQueryStore();
  const reportStore = useReportStore();
  const [, setLocation] = useLocation();

  const items = [
    {
      key: `databases`,
      label: `Databases`,
      children: databaseFiles
        .map((fileName) => ({
          key: `/db/${fileName}`,
          label: <Link to={`/db/${fileName}`}>{fileName}</Link>,
        }))
        .concat({
          key: "new-database",
          label: <Link href="/new-database">+ Create new database</Link>,
        }),
    },
    {
      key: `queries`,
      label: `Queries`,
      onClick: ({ key }: { key: string }) => {
        if (key === "new-query") {
          const id = addQuery();
          setLocation("/query/" + id);
        }

        if (key === "import-query") {
          const queryStr = prompt("Paste content of exported file");
          if (queryStr) {
            const id = importQuery(JSON.parse(queryStr) as Query);
            setLocation("/query/" + id);
          }
        }
      },
      children: Object.values(queryStore.queries)
        .map((query): { key: string; label: ReactElement | string } => ({
          key: query.id,
          label: <Link href={`/query/${query.id}`}>{query.label}</Link>,
        }))
        .concat({
          key: "new-query",
          label: "+ Create new query",
        })
        .concat({
          key: "import-query",
          label: "+ Import query",
        }),
    },
    {
      key: `reports`,
      label: `Reports`,
      onClick: ({ key }: { key: string }) => {
        if (key === "new-report") {
          const id = addReport();
          setLocation("/report/edit/" + id);
        }
      },
      children: Object.values(reportStore.reports)
        .map((report): { key: string; label: ReactElement | string } => ({
          key: "edit" + report.id,
          label: <Link href={`/report/edit/${report.id}`}>{report.label}</Link>,
        }))
        .concat({
          key: "new-report",
          label: "+ Create new report",
        }),
    },
    {
      key: `ownership`,
      label: <Link href="/ownership">Ownership (old)</Link>,
    },
  ];

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={20} minSize={10}>
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          style={{ overflow: "scroll", height: "100%" }}
          items={items}
        />
      </Panel>
      <PanelResizeHandle
        style={{ width: 10, background: "#f0f0f0", marginRight: 10 }}
      />
      <Panel minSize={30} style={{ height: "100%", overflow: "scroll" }}>
        {children}
      </Panel>
    </PanelGroup>
  );
};

export default MainMenu;

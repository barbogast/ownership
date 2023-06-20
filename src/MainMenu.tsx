import { Layout, Menu, theme } from "antd";
import { ReactElement } from "react";
import { Link, useLocation } from "wouter";

import useQueryStore, {
  Query,
  addQuery,
  importQuery,
} from "./query/queryStore";
import useReportStore, { addReport } from "./report/reportStore";

const databases = {
  key: `databases`,
  label: `Databases`,
  children: [
    {
      key: `database-1`,
      label: `Outstanding debt Europe 1995 - 2019`,
      title: `Outstanding debt Europe 1995 - 2019`,
      children: [
        {
          key: `table-1`,
          label: "table1",
        },
        { key: `table-2`, label: `table2` },
      ],
    },
    {
      key: `database-2`,
      label: "Temperature Measurements Canada and Alaska",
      title: `Temperature Measurements Canada and Alaska`,
      children: [
        { key: `table-3`, label: `table1` },
        { key: `table-4`, label: `table2` },
      ],
    },
    {
      key: "new-database",
      label: <Link href="/new-database">+ Create new database</Link>,
    },
  ],
};

type Props = {
  children?: ReactElement | ReactElement[] | null;
};
const MainMenu: React.FC<Props> = ({ children }) => {
  const queryStore = useQueryStore();
  const reportStore = useReportStore();
  const [, setLocation] = useLocation();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const items = [
    databases,
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
    <Layout
      style={{
        padding: "16px 0",
        background: colorBgContainer,
      }}
    >
      <Layout.Sider
        style={{
          background: colorBgContainer,
        }}
        width={300}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          style={{
            height: "100%",
          }}
          items={items}
        />
      </Layout.Sider>
      <Layout.Content
        style={{
          padding: "0 24px",
          minHeight: 280,
        }}
      >
        {children}
      </Layout.Content>
    </Layout>
  );
};

export default MainMenu;

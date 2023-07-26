import { Badge, Divider, Menu } from "antd";
import { ReactElement, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import useQueryStore, {
  Query,
  addQuery,
  importQuery,
} from "./query/queryStore";
import useReportStore, { addReport } from "./report/reportStore";
import { useRepoInfo } from "./util/utils";
import useModifiedStore from "./modifiedStore";
import RepositoryControl from "./RepositoryControl";
import useDatabaseDefinitionStore from "./databaseDefinition/databaseDefinitionStore";
import getSteps from "./createDatabaseWizard";
import WizardModal from "./wizard/WizardModal";

type Props = {
  children?: ReactElement | ReactElement[] | null;
};
const MainMenu: React.FC<Props> = ({ children }) => {
  const queryStore = useQueryStore();
  const databaseStore = useDatabaseDefinitionStore();
  const reportStore = useReportStore();
  const [location, setLocation] = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState("");
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const repositoryInfo = useRepoInfo();
  const { modifiedQueries } = useModifiedStore();

  const openFolder = (submenus: string[]) =>
    setOpenFolders((state) => [...new Set(state.concat(submenus))]);

  useEffect(() => {
    // This hook gets executed when the app launches and on subsequent url changes.
    // It will set the active menu item and add the folder of the active menu item
    // to the list of opened folders.
    // The keys of menu items and folders can be derived from the URL; menu items
    // match the url directly and folders match the path segement of the url
    setActiveMenuItem(location);
    const folder = location
      .split("/")
      .slice(0, -1)
      .filter((segment) => Boolean(segment));
    if (folder) {
      openFolder(folder);
    }
  }, [location]);

  if (!repositoryInfo) {
    return children;
  }

  const basepath = "/" + repositoryInfo.path;

  const databases = {
    key: `db`,
    label: `Databases`,
    children: Object.values(databaseStore)
      .map((db) => ({
        key: `${basepath}/db/${db.id}`,
        label: <Link href={`${basepath}/db/${db.id}`}>{db.label}</Link>,
      }))

      .concat({
        key: "new-database",
        label: (
          <WizardModal
            steps={getSteps(false)}
            initialResult={{
              id: "",
              label: "",
              tableName: "",
              csvContent: "",
              columns: [],
              parsedCsvContent: [],
            }}
            render={(openModal) => (
              <a onClick={openModal}>+ Create new database</a>
            )}
          />
        ),
      }),
  };

  const queries = {
    key: `query`,
    label: `Queries`,
    onClick: ({ key }: { key: string }) => {
      if (key === `new-query`) {
        const id = addQuery();
        setLocation(`${basepath}/query/${id}`);
      }

      if (key === "import-query") {
        const queryStr = prompt("Paste content of exported file");
        if (queryStr) {
          const id = importQuery(JSON.parse(queryStr) as Query);
          setLocation(`${basepath}/query/${id}`);
        }
      }
    },
    children: Object.values(queryStore)
      .map((query): { key: string; label: ReactElement | string } => ({
        key: `${basepath}/query/${query.id}`,
        label: (
          <Link href={`${basepath}/query/${query.id}`}>
            {modifiedQueries.includes(query.id) && (
              <Badge
                style={{ position: "absolute", left: 35 }}
                title="Modified"
                status="error"
              />
            )}
            {query.label}
          </Link>
        ),
      }))
      .concat({
        key: "new-query",
        label: "+ Create new query",
      })
      .concat({
        key: "import-query",
        label: "+ Import query",
      }),
  };

  const reports = {
    key: `report`,
    label: `Reports`,
    onClick: ({ key }: { key: string }) => {
      if (key === "new-report") {
        const id = addReport();
        setLocation(`${basepath}/report/edit/${id}`);
      }
    },
    children: Object.values(reportStore)
      .map((report): { key: string; label: ReactElement | string } => ({
        key: `${basepath}/report/edit/${report.id}`,
        label: (
          <Link href={`${basepath}/report/edit/${report.id}`}>
            {report.label}
          </Link>
        ),
      }))
      .concat({
        key: "new-report",
        label: "+ Create new report",
      }),
  };

  const ownership = {
    key: `/ownership`,
    label: <Link href="/ownership">Ownership (old)</Link>,
  };

  const devTools = {
    key: `/dev-tools`,
    label: <Link href={`${basepath}/dev-tools`}>DevTools</Link>,
  };

  const items = [databases, queries, reports, ownership, devTools];

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={20} minSize={10} style={{ marginRight: 10 }}>
        <RepositoryControl />
        <Divider style={{ margin: "12px 0" }} />
        <Menu
          mode="inline"
          style={{ overflow: "scroll", height: "100%" }}
          items={items}
          selectedKeys={[activeMenuItem]}
          openKeys={openFolders}
          onSelect={(selectInfo) => setActiveMenuItem(selectInfo.key)}
          onOpenChange={setOpenFolders}
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

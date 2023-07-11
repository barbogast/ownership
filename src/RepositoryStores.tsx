import { ReactElement, useEffect } from "react";
import { enable } from "./query/queryStore";
import useReportStore from "./report/reportStore";
import { useRepoInfo } from "./util/utils";
import Logger from "./util/logger";

const logger = new Logger("database");
type Props = {
  children: ReactElement[] | ReactElement;
};
const RepositoryStores: React.FC<Props> = ({ children }) => {
  const info = useRepoInfo();
  useEffect(() => {
    if (info) {
      logger.log("hydrate", info);

      enable(info);

      useReportStore.persist.setOptions({ name: `${info.path}/reports` });
      useReportStore.persist.rehydrate();
    }
  }, [info]);
  return children;
};

export default RepositoryStores;

import { ReactElement, useEffect } from "react";
import { useRepoInfo } from "./util/utils";
import Logger from "./util/logger";
import * as queryStore from "./query/queryStore";
import * as databaseDefinitionStore from "./databaseDefinitionStore";
import * as reportStore from "./report/reportStore";

const logger = new Logger("database");
type Props = {
  children: ReactElement[] | ReactElement;
};
const RepositoryStores: React.FC<Props> = ({ children }) => {
  const info = useRepoInfo();
  useEffect(() => {
    if (info) {
      logger.log("hydrate", info);

      queryStore.enable(info);
      databaseDefinitionStore.enable(info);
      reportStore.enable(info);
    }
  }, [info]);
  return children;
};

export default RepositoryStores;

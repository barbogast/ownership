import { ReactElement, useEffect, useState } from "react";
import { useRepoInfo } from "../util/utils";
import Logger from "../util/logger";
import { queryStore } from "../query/queryStore";
import { databaseDefinitionStore } from "../databaseDefinitionStore";
import * as reportStore from "../report/reportStore";

const logger = new Logger("main");
type Props = {
  children: ReactElement[] | ReactElement;
};
const WithNestedStores: React.FC<Props> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const info = useRepoInfo();
  useEffect(() => {
    if (info) {
      logger.log("rehydrate stores", info);

      queryStore.hydrate(info);
      databaseDefinitionStore.hydrate(info);
      reportStore.enable(info);
      setIsInitialized(true);
    }
  }, [info]);
  return isInitialized ? children : null;
};

export default WithNestedStores;

import { ReactElement, useEffect, useState } from "react";
import { useRepoInfo } from "../util/utils";
import Logger from "../util/logger";
import stores from "./stores";

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

      for (const store of stores) {
        store.hydrate(info);
      }
      setIsInitialized(true);
    }
  }, [info]);
  return isInitialized ? children : null;
};

export default WithNestedStores;

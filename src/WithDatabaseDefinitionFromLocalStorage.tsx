import React from "react";
import useDatabaseDefinitionStore, {
  DatabaseDefinition,
} from "./databaseDefinition/databaseDefinitionStore";

type Props = {
  id: string;
  child: (databaseDefinition: DatabaseDefinition) => JSX.Element;
};

const WithDatabaseDefinitionFromLocalStorage: React.FC<Props> = ({
  child,
  id,
}) => {
  const dbDef = useDatabaseDefinitionStore((state) => state[id]);
  if (!dbDef) {
    return `Query with ID ${id} not found.`;
  }
  return child(dbDef);
};

export default WithDatabaseDefinitionFromLocalStorage;

import { databaseDefinitionStore } from "../databaseDefinition/databaseDefinitionStore";
import { queryStore } from "../query/queryStore";
import { reportStore } from "../report/reportStore";

const stores = [queryStore, databaseDefinitionStore, reportStore];

export default stores;

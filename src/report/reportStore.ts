import { v4 as uuidv4 } from "uuid";
import { FileContents } from "../util/fsHelper";
import stringify from "safe-stable-stringify";
import NestedStore, { StoreConfig } from "../nestedStores";
// import { Block } from "@blocknote/core";

type Block = string[];
type Report = {
  id: string;
  label: string;
  blocks: Block[];
};

export type ReportState = { [reportId: string]: Report };

const initialState: ReportState = {};

type Files = "index.json" | "blocks.json";

type QueryStoreConfig = StoreConfig<Report, Record<string, Report>, Files>;

type ReportFiles = FileContents<"index.json" | "blocks.json">;
export const reportToFiles = (report: Report): ReportFiles => {
  const { blocks, ...partialReport } = report;
  const fileContents = {
    "index.json": stringify(partialReport, null, 2),
    "blocks.json": blocks ? stringify(blocks, null, 2) : "",
  };
  return fileContents;
};

export const filesToReport = (fileContents: ReportFiles): Report => {
  return {
    ...JSON.parse(fileContents["index.json"]),
    sqlStatement: fileContents["blocks.json"]
      ? JSON.parse(fileContents["blocks.json"])
      : [],
  };
};

const CURRENT_VERSION = 1;

export const reportStoreConfig: QueryStoreConfig = {
  entityToFiles: reportToFiles,
  filesToEntity: filesToReport,
  name: "reports",
  initialState,
  version: CURRENT_VERSION,
};

export const reportStore = new NestedStore(reportStoreConfig);
const useReportStore = reportStore.store;

export default useReportStore;

export const useReport = (id: string) => useReportStore((state) => state[id]);

export const addReport = () => {
  const id = uuidv4();
  useReportStore.setState((state) => {
    state[id] = {
      id,
      label: "New report",
      blocks: [],
    };
  });
  return id;
};

export const updateLabel = (queryId: string, label: string) =>
  useReportStore.setState((state) => {
    state[queryId].label = label;
  });

export const updateBlocks = (queryId: string, blocks: Block[]) =>
  useReportStore.setState((state) => {
    state[queryId].blocks = blocks;
  });

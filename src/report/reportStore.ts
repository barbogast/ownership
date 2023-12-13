import * as R from "remeda";
import { Folder, getFile, getFolder } from "../util/fsHelper";
import NestedStore, { StoreConfig } from "../nestedStores";
import { Draft } from "immer";
import { createId } from "../util/utils";
import { parseJson, stableStringify } from "../util/json";

type Block = string[];
export type Report = {
  id: string;
  label: string;
  blocks: Block[];
};

export type ReportState = { [reportId: string]: Report };

const initialState: ReportState = {};

type QueryStoreConfig = StoreConfig<Report, Record<string, Report>>;

export const exportToFolder = (state: ReportState): Folder => {
  const reportFolder: Folder = { files: {}, folders: {} };
  for (const report of Object.values(state)) {
    const { blocks, ...partialReport } = report;

    reportFolder.folders[report.id] = {
      files: {
        "index.json": stableStringify(partialReport),
        "blocks.json": stableStringify(blocks),
      },
      folders: {},
    };
  }
  return { files: {}, folders: { reports: reportFolder } };
};

export const importFromFolder = (root: Folder): ReportState =>
  R.mapValues(
    getFolder(root, "reports", { folders: {}, files: {} }).folders,
    (folder) => {
      const report = {
        ...parseJson(getFile(folder, "index.json")),
        blocks: JSON.parse(getFile(folder, "blocks.json", "")),
      } as Report;
      return report;
    }
  );

const CURRENT_VERSION = 1;

const migrations: Record<string, (state: ReportState) => ReportState> = {};

export const reportStoreConfig: QueryStoreConfig = {
  exportToFolder,
  importFromFolder,
  name: "reports",
  initialState,
  version: CURRENT_VERSION,
  migrations,
};

export const reportStore = new NestedStore(reportStoreConfig);
const useReportStore = reportStore.store;

export default useReportStore;

export const useReport = (id: string) => useReportStore((state) => state[id]);

const getReportFromDraft = (state: Draft<ReportState>, reportId: string) => {
  const repo = state[reportId];
  if (repo === undefined) {
    throw new Error(`No report with id "${reportId}" found`);
  }
  return repo;
};

export const addReport = () => {
  const id = createId();
  useReportStore.setState((state) => {
    state[id] = {
      id,
      label: "New report",
      blocks: [],
    };
  });
  return id;
};

export const updateLabel = (reportId: string, label: string) =>
  useReportStore.setState((state) => {
    const report = getReportFromDraft(state, reportId);
    report.label = label;
  });

export const updateBlocks = (reportId: string, blocks: Block[]) =>
  useReportStore.setState((state) => {
    const report = getReportFromDraft(state, reportId);
    report.blocks = blocks;
  });

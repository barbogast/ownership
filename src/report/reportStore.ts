import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { immer } from "zustand/middleware/immer";
import { getBasePath } from "../utils";
// import { Block } from "@blocknote/core";

type Block = string[];
type Report = {
  id: string;
  label: string;
  blocks: Block[];
};

type ReportState = {
  reports: { [reportId: string]: Report };
};

const demoReport = JSON.parse(
  '[{"id":"dd6d9638-6ea7-4a86-9deb-7216eb8f7d16","type":"heading","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","level":"1"},"content":[{"type":"text","text":"Analysis of ownership of government in Europe","styles":{}}],"children":[]},{"id":"e90c84fa-9116-4058-9e7d-19b66a7ba0d1","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"This is a fancy analysis that shows how you can build reports out of data in your browser","styles":{}}],"children":[]},{"id":"f044061e-cc74-4e3c-adec-c0d20dd9b199","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]},{"id":"36673422-9bce-42a0-89cf-7132c4ad5bff","type":"heading","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","level":"2"},"content":[{"type":"text","text":"Here is a fancy chart","styles":{}}],"children":[]},{"id":"2f1dceb0-e69c-4e12-a548-96d95c4eaa6e","type":"dataDisplay","props":{"textColor":"black","backgroundColor":"transparent","textAlignment":"left","queryId":"tableofownershipdistribution"},"content":[{"type":"text","text":"This is an explanatory text for this chart. It explains ","styles":{}},{"type":"text","text":"many","styles":{"bold":true}},{"type":"text","text":" things. Also, you can edit the chart using the \\"Edit\\" button on the right (if are viewing this in the editor).","styles":{}}],"children":[]},{"id":"7b11ba9b-ccbe-49b8-93dc-4c2ba2df7e40","type":"heading","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","level":"3"},"content":[{"type":"text","text":"More charts","styles":{}}],"children":[]},{"id":"489e9317-cac5-4fd1-b182-2a152750e479","type":"dataDisplay","props":{"textColor":"black","backgroundColor":"transparent","textAlignment":"left","queryId":"tableofownershiptime"},"content":[{"type":"text","text":"Again, with funny text.","styles":{}}],"children":[]},{"id":"5de73f4c-59b4-4b65-b3ac-8bf7dbdceef7","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]},{"id":"9185a159-b117-417c-b2e2-5c0ea1130810","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]},{"id":"db0b054e-f874-4ce4-a881-2fa4394f28d5","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]}]'
);
const initialState: ReportState = {
  reports: {
    "888abb49-2912-4ba0-affb-22a0ede59a5e": {
      id: "888abb49-2912-4ba0-affb-22a0ede59a5e",
      label: "Distribution of ownership",
      blocks: demoReport,
    },
  },
};

const persistConfig = {
  name: getBasePath() + "/reports",
  storage: createJSONStorage(() => localStorage),
};

const useReportStore = create(
  persist(
    immer<ReportState>(() => initialState),
    persistConfig
  )
);

export default useReportStore;

export const useReport = (id: string) =>
  useReportStore((state) => state.reports[id]);

export const addReport = () => {
  const id = uuidv4();
  useReportStore.setState((state) => {
    state.reports[id] = {
      id,
      label: "New report",
      blocks: [],
    };
  });
  return id;
};

export const updateLabel = (queryId: string, label: string) =>
  useReportStore.setState((state) => {
    state.reports[queryId].label = label;
  });

export const updateBlocks = (queryId: string, blocks: Block[]) =>
  useReportStore.setState((state) => {
    state.reports[queryId].blocks = blocks;
  });

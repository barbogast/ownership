export type StepName =
  | "stepOverview"
  | "stepCsv"
  | "stepCode"
  | "stepSql"
  | "stepPivot"
  | "stepTransform"
  | "stepChart"
  | "stepGit"
  | "stepShare"
  | "stepWebsite"
  | "stepExplore";

export type Result = Record<string, unknown>;

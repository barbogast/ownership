import { forwardRef, useRef, useImperativeHandle } from "react";
import Papa from "papaparse";

import { Step } from "../wizard/types";
import { analyzeCsvHeader } from "../util/csv";
import { StepResult } from "./types";

const getStep = () => {
  const step: Step<StepResult> = {
    type: "forwardRefComponent",
    label: "Parse CSV",
    forwardRefComponent: forwardRef(({ results }, parentRef) => {
      const inputRef = useRef<HTMLTextAreaElement>(null);

      useImperativeHandle(parentRef, () => ({
        getResult: (results) => ({
          ...results,
          csvContent: inputRef.current!.value,
        }),
      }));
      console.log("render");

      return (
        <textarea
          style={{ fontFamily: "monospace", height: "100%", width: "100%" }}
          ref={inputRef}
          defaultValue={results.csvContent}
        />
      );
    }),
    onNext: (results: StepResult) => {
      const result = Papa.parse<string[]>(results.csvContent);
      return { ...results, columns: analyzeCsvHeader(result.data) };
    },
  };
  return step;
};

export default getStep;
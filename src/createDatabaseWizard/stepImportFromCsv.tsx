import { forwardRef, useRef, useImperativeHandle } from "react";
import Papa from "papaparse";

import { Step } from "../components/wizard/types";
import { analyzeCsvHeader } from "../util/csv";
import { StepName, StepResult } from "./types";

const getStep = () => {
  const step: Step<StepName, StepResult> = {
    type: "forwardRefComponent",
    label: "Parse CSV",
    nextStep: {
      resultKey: "enablePostProcessing",
      resultValueMappings: [
        { value: true, stepName: "postProcessing" },
        { value: false, stepName: "configureColumns" },
      ],
    },
    forwardRefComponent: forwardRef(({ results }, parentRef) => {
      const inputRef = useRef<HTMLTextAreaElement>(null);

      useImperativeHandle(parentRef, () => ({
        getResult: (results) => ({
          ...results,
          csvContent: inputRef.current!.value,
        }),
      }));

      return (
        <textarea
          style={{ fontFamily: "monospace", height: "100%", width: "100%" }}
          ref={inputRef}
          defaultValue={results.csvContent}
          data-testid="csv-textarea"
          onKeyDown={(event) =>
            // Not sure why this is necessary, but without it, enter keys and arrow
            // keys will be propagated to the parent element
            event.stopPropagation()
          }
        />
      );
    }),
    submitStep: (results: StepResult) => {
      const result = Papa.parse<string[]>(results.csvContent);
      return {
        ...results,
        parsedCsvContent: result.data,
        // If post-processing is enabled we can defer analyzing the columns until after the post-processing
        columns: results.enablePostProcessing
          ? []
          : analyzeCsvHeader(result.data),
      };
    },
  };
  return step;
};

export default getStep;

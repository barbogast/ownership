import { forwardRef, useRef, useImperativeHandle } from "react";
import { Step } from "../components/wizard/types";
import { StepName, StepResult } from "./types";

const getStep = () => {
  const step: Step<StepName, StepResult> = {
    type: "forwardRefComponent",
    label: "Parse JSON",
    nextStep: "configureColumns",
    forwardRefComponent: forwardRef(({ results }, parentRef) => {
      const inputRef = useRef<HTMLTextAreaElement>(null);

      useImperativeHandle(parentRef, () => ({
        getResult: (results) => ({
          ...results,
          jsonContent: inputRef.current!.value,
        }),
      }));

      return (
        <textarea
          style={{ fontFamily: "monospace", height: "100%", width: "100%" }}
          ref={inputRef}
          defaultValue={results.jsonContent}
          data-testid="json-textarea"
          onKeyDown={(event) =>
            // Not sure why this is necessary, but without it, enter keys and arrow
            // keys will be propagated to the parent element
            event.stopPropagation()
          }
        />
      );
    }),
    submitStep: (results: StepResult) => {
      const result = JSON.parse(results.jsonContent);
      const jsonTypeToDbType = (value: unknown) => {
        switch (typeof value) {
          case "string":
            return "text";
          case "number":
            return value % 1 === 0 ? "integer" : "real";
          case "boolean":
            return "text";
          default:
            return "text";
        }
      };
      return {
        ...results,
        parsedContent: result,
        columns: Object.entries(result[0]).map(([key, value]) => ({
          sourceName: key,
          dbName: key,
          type: jsonTypeToDbType(value),
        })),
      };
    },
  };
  return step;
};

export default getStep;

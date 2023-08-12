import { Steps as StepsComponent } from "antd";
import { Step } from "./types";

type Props<T extends Record<string, unknown>> = {
  steps: Step<T>[];
  currentStepIndex: number;
};

const ProgressDisplay = <T extends Record<string, unknown>>({
  currentStepIndex,
  steps,
}: Props<T>) => {
  return (
    <StepsComponent
      direction="vertical"
      current={currentStepIndex}
      items={steps.map((step) => ({
        title: step.label,
        description: <span>&nbsp;</span>, // Required so that vertical line between elements is visible
      }))}
    />
  );
};

export default ProgressDisplay;

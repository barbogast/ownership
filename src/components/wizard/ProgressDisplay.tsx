import { Steps as StepsComponent } from "antd";
import { Step } from "./types";

type Props<StepName extends string, Results extends Record<string, unknown>> = {
  steps: Step<StepName, Results>[];
  currentStepIndex: number;
};

const ProgressDisplay = <
  StepName extends string,
  Results extends Record<string, unknown>
>({
  currentStepIndex,
  steps,
}: Props<StepName, Results>) => {
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

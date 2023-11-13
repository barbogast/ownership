import { Steps as StepsComponent } from "antd";
import { Step } from "./types";

type Props<StepName extends string, Results extends Record<string, unknown>> = {
  steps: Record<StepName, Step<StepName, Results>>;
  history: StepName[];
};

const ProgressDisplay = <
  StepName extends string,
  Results extends Record<string, unknown>
>({
  steps,
  history,
}: Props<StepName, Results>) => {
  // Previous steps and future steps as far as they are known
  const breadcrumbs: (StepName | "...")[] = [...history];

  // Follow the nextStep chain until we reach a step has muliple next steps
  const maybeAppendStep = (stepName: StepName) => {
    const nextStep = steps[stepName].nextStep;
    if (typeof nextStep === "string") {
      breadcrumbs.push(nextStep);
      maybeAppendStep(nextStep);
    } else if (typeof nextStep === "object") {
      breadcrumbs.push("...");
    }
  };

  maybeAppendStep(history.at(-1)!);

  return (
    <StepsComponent
      direction="vertical"
      current={history.length - 1}
      items={breadcrumbs.map((stepName) => ({
        title: stepName in steps ? steps[stepName].label : stepName,
        // description: <span>&nbsp;</span>, // Required so that vertical line between elements is visible
      }))}
    />
  );
};

export default ProgressDisplay;

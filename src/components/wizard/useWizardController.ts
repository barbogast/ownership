import { useState } from "react";
import { RefType, Step, WizardConfig } from "./types";
import Logger from "../../util/logger";

const logger = new Logger("wizard");

const useStepHistory = <StepName extends string>(initialStepName: StepName) => {
  const [steps, setSteps] = useState<StepName[]>([initialStepName]);
  const push = (stepName: StepName) =>
    setSteps((state) => [...state, stepName]);
  const pop = () => setSteps((state) => state.slice(0, -1));
  const reset = () => setSteps([initialStepName]);
  const getCurrent = (): StepName => steps[steps.length - 1]!;
  return { push, pop, reset, getCurrent };
};

const getNextStepName = <
  StepName extends string,
  Results extends Record<string, unknown>
>(
  currentStep: Step<StepName, Results>,
  result: Results
): StepName | undefined => {
  if (typeof currentStep.nextStep === "object") {
    for (const mapping of currentStep.nextStep.resultValueMappings) {
      if (mapping.value === result[currentStep.nextStep.resultKey]) {
        return mapping.stepName;
      }
    }
    throw new Error(
      `No next step found for value "${result[currentStep.nextStep.resultKey]}"`
    );
  } else {
    return currentStep.nextStep;
  }
};

const useWizardController = <
  StepName extends string,
  Results extends Record<string, unknown>
>(
  config: WizardConfig<StepName, Results>,
  initialResult: Results,
  initialStepName: StepName,
  childRef: React.MutableRefObject<RefType<Results>>
) => {
  const history = useStepHistory(initialStepName);

  const [currentResults, setCurrentResults] = useState<Results>(initialResult);

  const currentStepName = history.getCurrent();
  const currentStep = config.steps[currentStepName];
  if (!currentStep) {
    throw new Error(`No step with name "${currentStepName}" found`);
  }

  const goToNextStep = () => {
    let result = currentResults;
    if (currentStep.type === "forwardRefComponent") {
      result = childRef.current!.getResult(currentResults);
    }
    if (currentStep.submitStep) {
      result = currentStep.submitStep(result);
    }
    setCurrentResults(result);

    const nextStepName = getNextStepName<StepName, Results>(
      currentStep,
      result
    );

    if (nextStepName) {
      history.push(nextStepName);
    }

    logger.log("next step", { result, step: nextStepName });
  };

  const resetState = () => {
    setCurrentResults(initialResult);
    history.reset();
  };

  return {
    currentStepName,
    isInitialStep: currentStepName === initialStepName,
    isFinalStep: currentStep.nextStep === undefined,
    currentResults,
    currentStep,
    setResults: setCurrentResults,
    goToNextStep,
    goToPreviousStep: history.pop,
    resetState,
  };
};

export default useWizardController;

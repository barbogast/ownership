import { useState } from "react";
import { RefType, WizardConfig } from "./types";

const useStepHistory = <StepName extends string>(initialStepName: StepName) => {
  const [steps, setSteps] = useState<StepName[]>([initialStepName]);
  const push = (stepName: StepName) =>
    setSteps((state) => [...state, stepName]);
  const pop = () => setSteps((state) => state.slice(0, -1));
  const reset = () => setSteps([initialStepName]);
  const getCurrent = (): StepName => steps[steps.length - 1]!;
  return { push, pop, reset, getCurrent };
};

const useWizardController = <
  StepName extends string,
  Results extends Record<string, unknown>
>(
  config: WizardConfig<StepName, Results>,
  childRef: React.MutableRefObject<RefType<Results>>
) => {
  const history = useStepHistory(config.initialStepName);

  const [currentResults, setCurrentResults] = useState<Results>(
    config.initialResult
  );

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

    const nextStepName =
      typeof currentStep.nextStep === "function"
        ? currentStep.nextStep(result)
        : currentStep.nextStep;

    if (nextStepName) {
      history.push(nextStepName);
    }
  };

  const resetState = () => {
    setCurrentResults(config.initialResult);
    history.reset();
  };

  return {
    currentStepName,
    isInitialStep: currentStepName === config.initialStepName,
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

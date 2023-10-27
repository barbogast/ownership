import { useState } from "react";
import { RefType, WizardConfig } from "./types";

const useStepHistory = (initialStepName: string) => {
  const [steps, setSteps] = useState([initialStepName]);
  const push = (stepName: string) => setSteps((state) => [...state, stepName]);
  const pop = () => setSteps((state) => state.slice(0, -1));
  const reset = () => setSteps([initialStepName]);
  const getCurrent = () => steps[steps.length - 1]!;
  return { steps, push, pop, reset, getCurrent };
};

const useWizardController = <T extends Record<string, unknown>>(
  config: WizardConfig<T>,
  childRef: React.MutableRefObject<RefType<T>>
) => {
  const history = useStepHistory(config.initialStepName);
  const [currentResults, setCurrentResults] = useState<T>(config.initialResult);

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

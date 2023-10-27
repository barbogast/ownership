import { useState } from "react";
import { RefType, Step } from "./types";

const useStepHistory = (initialStepName: string) => {
  const [steps, setSteps] = useState([initialStepName]);
  const push = (stepName: string) => setSteps((state) => [...state, stepName]);
  const pop = () => setSteps((state) => state.slice(0, -1));
  const reset = () => setSteps([initialStepName]);
  const getCurrent = () => steps[steps.length - 1]!;
  return { steps, push, pop, reset, getCurrent };
};

const useWizardController = <T extends Record<string, unknown>>(
  steps: Record<string, Step<T>>,
  initialResult: T,
  initialStepName: string,
  childRef: React.MutableRefObject<RefType<T>>
) => {
  const history = useStepHistory(initialStepName);
  const [currentResults, setCurrentResults] = useState<T>(initialResult);

  const currentStepName = history.getCurrent();
  const currentStep = steps[currentStepName];
  if (!currentStep) {
    throw new Error(`No step with name "${currentStepName}" found`);
  }

  const goToNextStep = () => {
    let result = currentResults;
    if (currentStep.type === "forwardRefComponent") {
      result = childRef.current!.getResult(currentResults);
    }
    if (currentStep.onNext) {
      result = currentStep.onNext(result);
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

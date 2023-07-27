import { useState } from "react";
import { RefType, Step } from "./types";

const useWizardController = <T extends Record<string, unknown>>(
  steps: Step<T>[],
  initialResult: T,
  childRef: React.MutableRefObject<RefType<T>>
) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentResults, setCurrentResults] = useState<T>(initialResult);

  const currentStep = steps[currentStepIndex];
  if (!currentStep) {
    throw new Error(`No step with index ${currentStepIndex} found`);
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
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const resetState = () => {
    setCurrentResults(initialResult);
    setCurrentStepIndex(0);
  };

  return {
    currentStepIndex,
    currentResults,
    currentStep,
    setResults: setCurrentResults,
    goToNextStep,
    goToPreviousStep: () => setCurrentStepIndex(currentStepIndex - 1),
    resetState,
  };
};

export default useWizardController;

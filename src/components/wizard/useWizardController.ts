import { useState } from "react";
import { RefType, Step, WizardConfig } from "./types";
import Logger from "../../util/logger";

const logger = new Logger("wizard");

const useStepHistory = <
  StepName extends string,
  Results extends Record<string, unknown>
>(
  initialStepName: StepName
) => {
  const [steps, setSteps] = useState<StepName[]>([initialStepName]);
  const push = (stepName: StepName) =>
    setSteps((state) => [...state, stepName]);
  const pop = () => setSteps((state) => state.slice(0, -1));
  const reset = () => setSteps([initialStepName]);
  const getCurrent = (): StepName => steps[steps.length - 1]!;
  const getHistory = (): StepName[] => steps;
  const jumpToIndex = (
    targetIndex: number,
    allSteps: Record<StepName, Step<StepName, Results>>
  ) => {
    if (targetIndex <= steps.length - 1) {
      setSteps((state) => state.slice(0, targetIndex + 1));
    } else {
      const newSteps = [...steps];
      const maybeAddStep = (name: StepName) => {
        if (newSteps.length - 1 === targetIndex) {
          return;
        }
        const nextStep = allSteps[name].nextStep;
        if (typeof nextStep === "string") {
          newSteps.push(nextStep);
          maybeAddStep(nextStep);
        } else {
          throw new Error("Cannot jump to step with nextStep of type object");
        }
      };
      maybeAddStep(steps.at(-1)!);
      setSteps(newSteps);
    }
  };
  return { push, pop, reset, getCurrent, getHistory, jumpToIndex };
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
  const history = useStepHistory<StepName, Results>(initialStepName);
  const [errors, setErrors] = useState<string[]>([]);
  const [state, setState] = useState<"ready" | "loading" | "error">("ready");

  const [currentResults, setCurrentResults] = useState<Results>(initialResult);

  const currentStepName = history.getCurrent();
  const currentStep = config.steps[currentStepName];
  if (!currentStep) {
    throw new Error(`No step with name "${currentStepName}" found`);
  }

  const goToNextStep = async () => {
    setState("loading");
    let result = currentResults;
    if (currentStep.type === "forwardRefComponent") {
      result = childRef.current!.getResult(currentResults);
    }
    if (currentStep.submitStep) {
      try {
        result = await currentStep.submitStep(result);
      } catch (e) {
        setErrors([(e as Error).message]);
        setState("error");
        return { closeWizard: false };
      }
    }
    setCurrentResults(result);

    const nextStepName = getNextStepName<StepName, Results>(
      currentStep,
      result
    );

    if (nextStepName) {
      history.push(nextStepName);
    }
    setState("ready");
    setErrors([]);

    logger.log("next step", { result, step: nextStepName });
    return { closeWizard: nextStepName === undefined };
  };

  const jumpToIndex = (index: number) => {
    history.jumpToIndex(index, config.steps);
  };

  const resetState = () => {
    setCurrentResults(initialResult);
    setState("ready");
    setErrors([]);
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
    jumpToIndex,
    resetState,
    history: history.getHistory(),
    errors,
    state,
  };
};

export default useWizardController;

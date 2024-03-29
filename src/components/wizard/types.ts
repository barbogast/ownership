import { ButtonType } from "antd/es/button";

export type RefType<T> = {
  getResult: (results: T) => T;
};

type Props<T> = {
  results: T;
  setResults: React.Dispatch<React.SetStateAction<T>>;
};

type _SharedStepProperties<
  StepName extends string,
  Results extends Record<string, unknown>
> = {
  label: string;
  submitStep?: (context: Results) => Results | Promise<Results>;
  prepareStep?: (context: Results) => Results | Promise<Results>;
  nextButton?: {
    label?: string;
    type?: ButtonType;
  };
  nextStep:
    | StepName
    | {
        resultKey: keyof Results;
        resultValueMappings: { value: unknown; stepName: StepName }[];
      }
    | undefined;
};

export type WizardStepComponent<Results extends Record<string, unknown>> =
  React.FC<Props<Results>>;

export type WizardStepForwardRefComponent<
  Results extends Record<string, unknown>
> = React.ForwardRefExoticComponent<
  Props<Results> & React.RefAttributes<RefType<Results>>
>;

export type Step<
  StepName extends string,
  Results extends Record<string, unknown>
> =
  | ({
      type: "component";
      component: WizardStepComponent<Results>;
    } & _SharedStepProperties<StepName, Results>)
  | ({
      type: "forwardRefComponent";
      forwardRefComponent: WizardStepForwardRefComponent<Results>;
    } & _SharedStepProperties<StepName, Results>);

export type WizardConfig<
  StepName extends string,
  Results extends Record<string, unknown>
> = {
  steps: Record<StepName, Step<StepName, Results>>;
};

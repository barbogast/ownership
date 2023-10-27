import { ButtonType } from "antd/es/button";

export type RefType<T> = {
  getResult: (results: T) => T;
};

type Props<T> = {
  results: T;
  setResults: React.Dispatch<React.SetStateAction<T>>;
};

type _SharedStepProperties<Results> = {
  label: string;
  submitStep?: (context: Results) => Results;
  nextButton?: {
    label?: string;
    type?: ButtonType;
  };
  nextStep: string | ((context: Results) => string | undefined) | undefined;
};

export type Step<Results extends Record<string, unknown>> =
  | ({
      type: "component";
      component: React.FC<Props<Results>>;
    } & _SharedStepProperties<Results>)
  | ({
      type: "forwardRefComponent";
      forwardRefComponent: React.ForwardRefExoticComponent<
        Props<Results> & React.RefAttributes<RefType<Results>>
      >;
    } & _SharedStepProperties<Results>);

export type WizardConfig<Results extends Record<string, unknown>> = {
  steps: Record<string, Step<Results>>;
  initialResult: Results;
  initialStepName: string;
};

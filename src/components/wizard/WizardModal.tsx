import { Modal, Button, Layout, theme, Alert } from "antd";
import Sider from "antd/es/layout/Sider";
import { useState, useRef, useEffect } from "react";
import { RefType, WizardConfig } from "./types";
import useWizardController from "./useWizardController";
import { Content } from "antd/es/layout/layout";
import ProgressDisplay from "./ProgressDisplay";

type Props<
  StepName extends string,
  ResultType extends Record<string, unknown>
> = {
  renderTrigger: (openModal: () => void) => React.ReactNode;
  title: string;
  config: WizardConfig<StepName, ResultType>;
  initialResult: ResultType;
  initialStepName: StepName;
  width?: string | number;
  navigationAllowed?: boolean;
  hideStepNumbers?: boolean;
};

const { useToken } = theme;

const WizardModal = <
  StepName extends string,
  ResultType extends Record<string, unknown>
>({
  renderTrigger,
  title,
  config,
  initialResult,
  initialStepName,
  width,
  navigationAllowed,
  hideStepNumbers,
}: Props<StepName, ResultType>) => {
  const [isOpen, setIsOpen] = useState(false);
  const childRef = useRef<RefType<ResultType>>({ getResult: (r) => r });
  const { token } = useToken();

  const {
    currentResults,
    currentStep,
    setResults,
    goToNextStep,
    goToPreviousStep,
    jumpToIndex,
    resetState,
    isInitialStep,
    isFinalStep,
    history,
    state,
    errors,
  } = useWizardController(config, initialResult, initialStepName, childRef);

  const onPrevButton = () => {
    if (isInitialStep) {
      setIsOpen(false);
    } else {
      goToPreviousStep();
    }
  };

  const onNextButton = async () => {
    const result = await goToNextStep();
    if (result.closeWizard) {
      setIsOpen(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(resetState, [isOpen]);

  return (
    <>
      {renderTrigger(() => setIsOpen(true))}
      {isOpen && (
        <Modal
          width={width ?? "80%"}
          bodyStyle={{ height: "60vh", overflow: "auto" }}
          title={title}
          open={isOpen}
          onCancel={() => setIsOpen(false)}
          footer={[
            ...errors.map((error) => <Alert message={error} type="error" />),
            <Button key="back" onClick={onPrevButton}>
              {isInitialStep ? "Cancel" : "Previous"}
            </Button>,
            <Button
              key="next"
              onClick={onNextButton}
              loading={state === "loading"}
              type={currentStep.nextButton?.type}
            >
              {currentStep.nextButton?.label ||
                (isFinalStep ? "Finish" : "Next")}
            </Button>,
          ]}
        >
          <Layout
            style={{
              background: token.colorBgContainer,
              height: "95%",
              padding: 10,
            }}
          >
            <Sider theme="light" width={300}>
              <ProgressDisplay<StepName, ResultType>
                steps={config.steps}
                history={history}
                onStepClick={navigationAllowed ? jumpToIndex : undefined}
                hideStepNumbers={hideStepNumbers}
              />
            </Sider>
            <Content style={{ height: "100%", overflow: "auto" }}>
              {currentStep.type === "component" ? (
                <currentStep.component
                  results={currentResults}
                  setResults={setResults}
                />
              ) : (
                <currentStep.forwardRefComponent
                  results={currentResults}
                  setResults={setResults}
                  ref={childRef}
                />
              )}
            </Content>
          </Layout>
        </Modal>
      )}
    </>
  );
};

export default WizardModal;

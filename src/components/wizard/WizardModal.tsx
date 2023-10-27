import { Modal, Button, Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { useState, useRef, useEffect } from "react";
import { RefType, Step } from "./types";
import useWizardController from "./useWizardController";
import { Content } from "antd/es/layout/layout";

type Props<ResultType extends Record<string, unknown>> = {
  steps: Record<string, Step<ResultType>>;
  initialResult: ResultType;
  render: (openModal: () => void) => React.ReactNode;
  title: string;
  initialStepName: string;
};
const WizardModal = <ResultType extends Record<string, unknown>>({
  steps,
  initialResult,
  render,
  title,
  initialStepName,
}: Props<ResultType>) => {
  const [isOpen, setIsOpen] = useState(false);
  const childRef = useRef<RefType<ResultType>>({ getResult: (r) => r });

  const {
    currentResults,
    currentStep,
    setResults,
    goToNextStep,
    goToPreviousStep,
    resetState,
    isInitialStep,
    isFinalStep,
  } = useWizardController(steps, initialResult, initialStepName, childRef);

  const onPrevButton = () => {
    if (isInitialStep) {
      setIsOpen(false);
    } else {
      goToPreviousStep();
    }
  };

  const onNextButton = () => {
    goToNextStep();
    if (isFinalStep) {
      setIsOpen(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(resetState, [isOpen]);

  return (
    <>
      {render(() => setIsOpen(true))}
      {isOpen && (
        <Modal
          width="80%"
          //   height="80%"
          bodyStyle={{ height: "60vh", overflow: "auto" }}
          title={title}
          open={isOpen}
          onCancel={() => setIsOpen(false)}
          footer={[
            <Button key="back" onClick={onPrevButton}>
              {isInitialStep ? "Cancel" : "Previous"}
            </Button>,
            <Button
              key="next"
              onClick={onNextButton}
              type={currentStep.nextButton?.type}
            >
              {currentStep.nextButton?.label ||
                (isFinalStep ? "Finish" : "Next")}
            </Button>,
          ]}
        >
          <Layout style={{ background: "white", height: "95%" }}>
            <Sider theme="light">
              {/* <ProgressDisplay
                steps={steps}
                currentStepIndex={currentStepIndex}
              /> */}
            </Sider>
            <Content style={{ height: "100%" }}>
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

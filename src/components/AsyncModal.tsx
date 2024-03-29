import { Alert, Modal, message } from "antd";
import { useState } from "react";
import * as R from "remeda";

type Props = {
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  renderTrigger: (openModal: () => void) => React.ReactNode;
  children: React.ReactNode;
  label: string;
  okText?: string;
  fullscreen?: boolean;
};

const AsyncModal: React.FC<Props> = ({
  children,
  onSubmit,
  onCancel,
  renderTrigger,
  label,
  okText,
  fullscreen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [messageApi, contextHolder] = message.useMessage();

  const submit = () => {
    const maybePromise = onSubmit();
    if (R.isPromise(maybePromise)) {
      setIsLoading(true);
      setErrorMessage(undefined);
      maybePromise
        .then(() => {
          setIsLoading(false);
          setIsOpen(false);
          return messageApi.open({
            type: "success",
            content: label + " was successful.",
          });
        })
        .catch((err) => {
          console.error(err);
          setErrorMessage(err);
          setIsLoading(false);
          if (err.name === "HttpError") {
            setErrorMessage(`${err.message}: ${err.data.response}`);
          } else {
            setErrorMessage(err.message);
          }
          return messageApi.open({
            type: "error",
            content: label + " failed.",
          });
        });
    } else {
      setIsOpen(false);
    }
  };

  const cancel = async () => {
    if (onCancel) {
      await onCancel();
    }
    setIsOpen(false);
  };

  return (
    <>
      {renderTrigger(() => setIsOpen(true))}
      {contextHolder}
      {isOpen && (
        <Modal
          title={label}
          open={isOpen}
          onOk={() => submit()}
          onCancel={cancel}
          confirmLoading={isLoading}
          width={fullscreen ? "90%" : undefined}
          style={fullscreen ? { top: 50, bottom: 50 } : {}}
          okText={okText}
        >
          {children}
          {errorMessage && <Alert message={errorMessage} type="error" />}
        </Modal>
      )}
    </>
  );
};

export default AsyncModal;

import { Alert, Modal, message } from "antd";
import { useState } from "react";
import { isPromise } from "../util/utils";

type Props = {
  onSubmit: () => void | Promise<void>;
  renderTrigger: (openModal: () => void) => React.ReactNode;
  children: React.ReactNode;
  label: string;
};

const AsyncModal: React.FC<Props> = ({
  children,
  onSubmit,
  renderTrigger,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [messageApi, contextHolder] = message.useMessage();

  const submit = () => {
    const maybePromise = onSubmit();
    if (isPromise(maybePromise)) {
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
    }
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
          onCancel={() => setIsOpen(false)}
          confirmLoading={isLoading}
        >
          {children}
          {errorMessage && <Alert message={errorMessage} type="error" />}
        </Modal>
      )}
    </>
  );
};

export default AsyncModal;

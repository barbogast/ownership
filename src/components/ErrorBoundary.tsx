import { Alert } from "antd";
import React, { ErrorInfo } from "react";

type Props = {
  children: React.ReactNode;
};

type State =
  | {
      hasError: true;
      error: Error;
    }
  | {
      hasError: false;
    };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Alert type="error" message="Something went wrong." />
          <pre>{JSON.stringify(this.state.error)}</pre>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

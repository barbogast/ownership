export type ExecutionError = {
  error: Error;
  position?: { line: number; column: number };
};

export type ExecutionResult<ReturnValue> =
  | { success: true; returnValue: ReturnValue }
  | {
      success: false;
      error: ExecutionError;
    };

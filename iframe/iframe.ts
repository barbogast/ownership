const LOGGING_ENABLED = false;

const log = (...args: unknown[]) =>
  // eslint-disable-next-line no-console
  LOGGING_ENABLED && console.log("[iframe]", ...args);

log("iframe initialized");

export type Params = {
  params: Record<string, unknown>;
  code: string;
  functionName: string;
};

export type Result<ReturnValue> =
  | { success: true; returnValue: ReturnValue }
  | { success: false; error: unknown };

window.addEventListener("message", async (event) => {
  log("Received message", event.data);

  const data = event.data as Params;
  const mainWindow = event.source!;

  const argTuples = Object.entries(data.params);
  const argNames = argTuples.map(([name]) => name);
  const argValues = argTuples.map(([, value]) => value);

  const finalCode = `${data.code}
      return ${data.functionName} (${argNames.join(", ")})
    `;

  log("Executing code");
  log(finalCode);
  log("params", data.params);

  let result: Result<unknown>;
  try {
    const func = new Function(...argNames, finalCode);
    log(argNames);
    const returnValue = await func(...argValues);
    log("Execution successful", { returnValue });
    result = { success: true, returnValue };
  } catch (error) {
    log("Execution failed", { error });
    result = { success: false, error };
  }

  // @ts-expect-error According to the type defs this is should be valid, but TS still reports an error :confused
  mainWindow.postMessage(result, event.origin);
});

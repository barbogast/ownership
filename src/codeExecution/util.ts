import sourceMap from "source-map-js";

import Logger from "../util/logger";
import { ExecutionResult } from "./types";
import { Params, Result } from "../../iframe/iframe";

const logger = new Logger("codeExecution");

export const getPositionFromStacktrace = (stack: string) => {
  if (!stack) {
    return;
  }

  const line = stack
    .split("\n")
    .find((e) => e.includes("<anonymous>:") || e.includes("Function:"));

  if (!line) {
    return;
  }

  const re = line.includes("<anonymous>:")
    ? /<anonymous>:(\d+):(\d+)/
    : /Function:(\d+):(\d+)/;
  const result = re.exec(line);
  if (!result) {
    return;
  }
  return {
    line: parseInt(result[1]!) - 2, // No idea but the browser seems to add 2 to the line number
    column: parseInt(result[2]!),
  };
};

export const executeInIframe = <ReturnValue>(
  code: string,
  functionName: string,
  functionParams: Record<string, unknown>
): Promise<ReturnValue> => {
  // Security measures:
  // - iframe element is created and destroyed on each execution so the executed code cannot perist data or code within the iframe
  // - using sandbox="allow-scribts" limits the iframe's capabilities
  logger.time("total");
  return new Promise((resolve, reject) => {
    const element = document.createElement("iframe");
    element.setAttribute("src", "/iframe/");
    element.setAttribute("sandbox", "allow-scripts"); // Do NOT add allow-same-origin, it would practically disable the sandbox
    element.style.display = "none";

    const onMessage = (event: MessageEvent) => {
      logger.timeEnd("execution");
      const data = event.data as Result<ReturnValue>;
      logger.log("onMessage", { data });
      // Sandboxed iframes which lack the 'allow-same-origin' header have "null" rather than a valid origin.
      if (event.origin === "null" && event.source === element.contentWindow) {
        if (data.success) {
          resolve(data.returnValue);
        } else {
          reject(data.error);
        }
      }

      document.body.removeChild(element);
      window.removeEventListener("message", onMessage);
      logger.timeEnd("total");
    };

    element.onload = () => {
      const targetOrigin = "*";
      // I'd love to restrict the origin to the actual domain, but that doesn't seem to be possible
      // as the iframe's origin is "null" when using the sandbox attribute, and the browser (at least Chrome)
      // doesn't allow passing 'null'.
      // Enabling sandbox="allow-same-origin" would allow to specify the origin, but would significantly
      // weaken the security of the sandbox, so let's not dot that.
      const iframeParams: Params = {
        code,
        params: functionParams,
        functionName,
      };
      logger.time("execution");
      element.contentWindow!.postMessage(iframeParams, targetOrigin);
    };

    window.addEventListener("message", onMessage);
    document.body.appendChild(element);
  });
};

export const executeTypescriptCode = async <ReturnValue>(
  code: string,
  functionName: string,
  functionArguments: Record<string, unknown>
): Promise<ExecutionResult<ReturnValue>> => {
  const ts: { default: typeof import("typescript") } = await import(
    // @ts-expect-error Didn't find a way to make vscode understand the types for this
    "https://esm.run/typescript@5.1.6"
  );
  const transpiled = ts.default.transpileModule(code, {
    compilerOptions: { sourceMap: true },
  });

  const argTuples = Object.entries(functionArguments);
  const argNames = argTuples.map(([name]) => name);

  const finalCode = `${transpiled.outputText}
      return ${functionName} (${argNames.join(", ")})
    `;

  logger.log("Executing code", { code: finalCode, functionArguments });

  try {
    const returnValue = await executeInIframe<ReturnValue>(
      transpiled.outputText,
      functionName,
      functionArguments
    );
    logger.log("Execution successful", { returnValue });
    return { success: true, returnValue };
  } catch (err) {
    const smc = new sourceMap.SourceMapConsumer(
      JSON.parse(transpiled.sourceMapText!)
    );

    let transpiledPosition:
      | ReturnType<typeof getPositionFromStacktrace>
      | undefined;
    try {
      transpiledPosition = getPositionFromStacktrace((err as Error).stack!);
    } catch (e) {
      logger.error("Failed to get position from stacktrace", {
        stack: (err as Error).stack,
      });
    }

    const position = transpiledPosition
      ? smc.originalPositionFor(transpiledPosition)
      : undefined;
    logger.log("Execution failed", { err, position });
    return { success: false, error: { error: err as Error, position } };
  }
};

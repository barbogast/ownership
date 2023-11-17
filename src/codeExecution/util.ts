import sourceMap from "source-map-js";

import Logger from "../util/logger";
import { ExecutionResult } from "./types";

const logger = new Logger("codeExecution");

export const getPositionFromStacktrace = (stack: string) => {
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

export const executeTypescriptCode = async <ReturnValue>(
  code: string,
  functionName: string,
  functionArguments: Record<string, unknown>
): Promise<ExecutionResult<ReturnValue>> => {
  // @ts-expect-error Hack for typescript in browser to not crash
  window.process = { versions: {} };

  const ts: { default: typeof import("typescript") } = await import(
    // @ts-expect-error Didn't find a way to make vscode understand the types for this
    "https://esm.run/typescript@5.1.6"
  );
  const transpiled = ts.default.transpileModule(code, {
    compilerOptions: { sourceMap: true },
  });

  const argTuples = Object.entries(functionArguments);
  const argNames = argTuples.map(([name]) => name);
  const argValues = argTuples.map(([, value]) => value);

  const finalCode = `${transpiled.outputText}
      return ${functionName} (${argNames.join(", ")})
    `;

  logger.log("Executing code", { code: finalCode });

  try {
    const func = new Function(...argNames, finalCode);
    const returnValue = await func(...argValues);
    logger.log("Execution successful", { returnValue });
    return { success: true, returnValue };
  } catch (err) {
    const smc = new sourceMap.SourceMapConsumer(
      JSON.parse(transpiled.sourceMapText!)
    );

    const transpiledPosition = getPositionFromStacktrace((err as Error).stack!);
    const position = transpiledPosition
      ? smc.originalPositionFor(transpiledPosition)
      : undefined;
    logger.log("Execution failed", { err, position });
    return { success: false, error: { error: err as Error, position } };
  }
};

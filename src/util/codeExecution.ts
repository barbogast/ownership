import sourceMap from "source-map-js";
import { getPositionFromStacktrace } from "./utils";

type ExecutionResult =
  | { success: true; returnValue: unknown }
  | {
      success: false;
      error: Error;
      position?: { line: number; column: number };
    };

export const executeTypescriptCode = async (
  code: string,
  functionArguments: unknown
): Promise<ExecutionResult> => {
  // @ts-expect-error Hack for typescript in browser to not crash
  window.process = { versions: {} };

  const ts: { default: typeof import("typescript") } = await import(
    // @ts-expect-error Didn't find a way to make vscode understand the types for this
    "https://esm.run/typescript@5.1.6"
  );
  const transpiled = ts.default.transpileModule(code, {
    compilerOptions: { sourceMap: true },
  });

  const finalCode = `${transpiled.outputText}
      return transform(queryResult)
    `;

  try {
    const func = new Function("queryResult", finalCode);
    const returnValue = func(functionArguments);
    return { success: true, returnValue };
  } catch (err) {
    const smc = new sourceMap.SourceMapConsumer(
      JSON.parse(transpiled.sourceMapText!)
    );

    const transpiledPosition = getPositionFromStacktrace((err as Error).stack!);
    const position = transpiledPosition
      ? smc.originalPositionFor(transpiledPosition)
      : undefined;
    return { success: false, error: err as Error, position };
  }
};

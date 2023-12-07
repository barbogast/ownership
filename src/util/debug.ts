const debug = {
  // These functions need to be accessed by end-to-end tests directly
  getE2eExports: async () => {
    const [{ executeTypescriptCode }] = await Promise.all([
      import("../codeExecution/util"),
    ]);

    return {
      executeTypescriptCode,
    };
  },
};

export type Debug = typeof debug;

window.__debug = debug;

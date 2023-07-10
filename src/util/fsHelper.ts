import LightningFS from "@isomorphic-git/lightning-fs";

import { logger } from "./utils";

export type FileContents = Record<string, string>;

export default class FsHelper {
  fs: LightningFS;

  constructor(name: string) {
    // @ts-expect-error https://github.com/isomorphic-git/lightning-fs/commit/76dc7ac318ec79ea7e9c770df78e2ed6ff0306e6
    const options: LightningFS.Options = { wipe: true };
    this.fs = new LightningFS(name, options);
  }

  readFile = (path: string) => this.fs.promises.readFile(path, "utf8");

  mkdir_p = async (path: string) => {
    let fullPath = "";
    for (const segment of path.split("/").filter(Boolean)) {
      fullPath += "/" + segment;
      try {
        await this.fs.promises.stat(fullPath);
        logger("git", "mkdir_p exists", { fullPath });
      } catch (err) {
        if ((err as { code: string }).code === "ENOENT") {
          logger("git", "mkdir", { fullPath });
          await this.fs.promises.mkdir(fullPath);
        }
      }
    }
  };

  readFilesInDirectory = async (directory: string) => {
    const fileContents: Record<string, string> = {};
    const files = await this.fs.promises.readdir(directory);
    for (const file of files) {
      const content = await this.readFile(directory + "/" + file);
      fileContents[file] = content as string;
    }
    return fileContents;
  };

  writeFilesToDirectory = async (
    directory: string,
    fileContents: FileContents
  ) => {
    for (const [filename, contents] of Object.entries(fileContents)) {
      await this.fs.promises.writeFile(directory + "/" + filename, contents);
    }
  };
}

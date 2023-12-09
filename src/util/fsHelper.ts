import { PromiseFsClient } from "isomorphic-git";
import * as R from "remeda";

import Logger from "./logger";

const logger = new Logger("fs");

export type FileContents<T extends string> = Record<T, string>;

export default class FsHelper {
  fs: PromiseFsClient;

  constructor(fs: PromiseFsClient) {
    this.fs = fs;
  }

  readFile = (path: string) => this.fs.promises.readFile(path, "utf8");

  mkdir_p = async (path: string) => {
    let fullPath = "";
    for (const segment of path.split("/").filter(Boolean)) {
      fullPath += "/" + segment;
      try {
        await this.fs.promises.stat(fullPath);
        logger.log("mkdir_p exists", { fullPath });
      } catch (err) {
        if ((err as { code: string }).code === "ENOENT") {
          logger.log("mkdir", { fullPath });
          await this.fs.promises.mkdir(fullPath);
        }
      }
    }
  };

  readFilesInDirectory = async (directory: string) => {
    const fileContents: FileContents<string> = {};
    const entries = await this.fs.promises.readdir(directory);
    for (const entry of entries) {
      const path = directory + "/" + entry;
      const stat = await this.fs.promises.stat(path);
      if (stat.isDirectory()) {
        const subDirectoryFileContents = await this.readFilesInDirectory(path);
        //
        Object.assign(
          fileContents,
          R.mapKeys(subDirectoryFileContents, (key) => entry + "/" + key)
        );
      } else {
        const content = await this.readFile(path);
        fileContents[entry] = content as string;
      }
    }
    return fileContents;
  };

  writeFilesToDirectory = async <T extends string>(
    directory: string,
    fileContents: FileContents<T>
  ) => {
    for (const [filename, contents] of Object.entries<string>(fileContents)) {
      const folders = filename.split("/").slice(0, -1).join("/");
      if (folders) {
        await this.mkdir_p(directory + "/" + folders);
      }

      if (contents) {
        await this.fs.promises.writeFile(directory + "/" + filename, contents);
      }
    }
  };
}

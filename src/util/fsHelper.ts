import { PromiseFsClient } from "isomorphic-git";
import * as R from "remeda";

import Logger from "./logger";

const logger = new Logger("fs");

export type FileContents<T extends string> = Record<T, string>;

export type Folder = {
  files: Record<string, string>;
  folders: Record<string, Folder>;
};

export default class FsHelper {
  fs: PromiseFsClient;

  constructor(fs: PromiseFsClient) {
    this.fs = fs;
  }

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

  writeFolder = async (directory: string, folder: Folder) => {
    for (const [name, contents] of Object.entries(folder.folders)) {
      await this.mkdir_p(`${directory}/${name}`);
      await this.writeFolder(`${directory}/${name}`, contents);
    }

    for (const [name, contents] of Object.entries(folder.files)) {
      if (contents) {
        await this.fs.promises.writeFile(`${directory}/${name}`, contents);
      }
    }
  };

  readFolder = async (directory: string): Promise<Folder> => {
    const folder: Folder = { files: {}, folders: {} };
    const entries = await this.fs.promises.readdir(directory);
    for (const entry of entries) {
      const path = `${directory}/${entry}`;
      const stat = await this.fs.promises.stat(path);
      if (stat.isDirectory()) {
        if (entry === ".git") {
          // We are not interested in the .git folder
          continue;
        }
        folder.folders[entry] = await this.readFolder(path);
      } else {
        const content = await this.fs.promises.readFile(path, "utf8");
        folder.files[entry] = content as string;
      }
    }
    return folder;
  };
}

// Convert Folder structure into a flat object
export const flattenFolder = (folder: Folder): FileContents<string> => {
  const files: FileContents<string> = {};
  for (const [name, contents] of Object.entries(folder.files)) {
    files[name] = contents;
  }

  for (const [name, contents] of Object.entries(folder.folders)) {
    Object.assign(
      files,
      R.mapKeys(flattenFolder(contents), (key) => name + "/" + key)
    );
  }
  return files;
};

export const omitEmpty = (folder: Folder): Folder => {
  const files = R.omitBy(folder.files, (value) => !value);
  const folders = R.pipe(
    folder.folders,
    R.mapValues(omitEmpty),
    R.omitBy(
      (contents) =>
        Object.keys(contents.files).length === 0 &&
        Object.keys(contents.folders).length === 0
    )
  );

  return { files, folders };
};

export const getFolder = (
  parentFolder: Folder,
  name: string,
  defaultFolder?: Folder
): Folder => {
  const entry = parentFolder.folders[name];
  if (!entry) {
    if (defaultFolder === undefined) {
      throw new Error(`Folder "${name}" not found`);
    } else {
      return defaultFolder;
    }
  }
  return entry;
};

export const getFile = (
  folder: Folder,
  name: string,
  defaultContent?: string
): string => {
  const entry = folder.files[name];
  if (!entry) {
    if (defaultContent === undefined) {
      throw new Error(`File "${name}" not found`);
    } else {
      return defaultContent;
    }
  }
  return entry;
};

export const mergeFolders = (folder1: Folder, folder2: Folder): Folder => {
  if (
    R.intersection(Object.keys(folder1.folders), Object.keys(folder2.folders))
      .length !== 0
  ) {
    throw new Error("Duplicate folder names");
  }
  if (
    R.intersection(Object.keys(folder1.files), Object.keys(folder2.files))
      .length !== 0
  ) {
    throw new Error("Duplicate file names");
  }
  const files = { ...folder1.files, ...folder2.files };
  const folders = { ...folder1.folders, ...folder2.folders };
  return { files, folders };
};

export const insertIntoFolder = (
  folder: Folder,
  path: string,
  contents: string
): void => {
  const [head, ...tail] = path.split("/");
  if (tail.length === 0) {
    folder.files[head!] = contents;
    return;
  }

  let subFolder = folder.folders[head!];
  if (!subFolder) {
    subFolder = { files: {}, folders: {} };
    folder.folders[head!] = subFolder;
  }
  insertIntoFolder(subFolder, tail.join("/"), contents);
};

import fs from "fs";
import http from "isomorphic-git/http/web";
import LightningFS from "@isomorphic-git/lightning-fs";
import { RepositoryInfo } from "../types";
import FsHelper, { Folder, flattenFolder, omitEmpty } from "./fsHelper";
import GitHelper, { Auth } from "./gitHelpers";

// @ts-expect-error https://github.com/isomorphic-git/lightning-fs/commit/76dc7ac318ec79ea7e9c770df78e2ed6ff0306e6
const fsOptions: LightningFS.Options = { wipe: true };

export const getHelpersBrowser = (info: RepositoryInfo, auth?: Auth) => {
  const fs = new LightningFS(info.organization, fsOptions);
  const fsHelper = new FsHelper(fs);
  const gitHelper = new GitHelper({ fs, http, root: "/" + info.path, auth });
  return { fsHelper, gitHelper };
};

export const getHelpersNode = ({
  gitRoot,
  auth,
  disableCorsProxy,
}: {
  gitRoot: string;
  auth?: Auth;
  disableCorsProxy?: boolean;
}) => {
  const fsHelper = new FsHelper(fs);
  const gitHelper = new GitHelper({
    fs,
    http,
    root: gitRoot,
    auth,
    disableCorsProxy,
  });
  return { fsHelper, gitHelper };
};

export const saveToGit = async (
  helpers: { fsHelper: FsHelper; gitHelper: GitHelper },
  url: string,
  folder: Folder
) => {
  const { fsHelper, gitHelper } = helpers;
  await gitHelper.clone(url);

  const cleanedFolder = omitEmpty(folder);
  await fsHelper.writeFolder(gitHelper.root, cleanedFolder);

  const flattened = flattenFolder(cleanedFolder);
  for (const path of Object.keys(flattened)) {
    await gitHelper.add(path);
  }

  await gitHelper.commit();
  await gitHelper.push();
};

export const loadFromGit = async (
  helpers: {
    fsHelper: FsHelper;
    gitHelper: GitHelper;
  },
  url: string
) => {
  const { fsHelper, gitHelper } = helpers;
  await gitHelper.clone(url);
  const folder = await fsHelper.readFolder(gitHelper.root);
  return folder;
};

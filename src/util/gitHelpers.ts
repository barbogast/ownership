import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

import LightningFS from "@isomorphic-git/lightning-fs";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";

const author = {
  name: "Mr. Test",
  email: "mrtest@example.com",
};

export default class GitHelper {
  fs: LightningFS;
  root: string;

  constructor(fs: LightningFS, root: string) {
    this.fs = fs;
    this.root = root;
  }

  clone = (repositoryPath: string, username: string, password: string) =>
    git.clone({
      fs: this.fs,
      http,
      dir: this.root,
      url: "https://github.com/" + repositoryPath,
      corsProxy: "https://cors.isomorphic-git.org", // TODO: we probably can't keep using this
      onAuth: () => ({ username, password }),
    });

  clone2 = (url: string, username: string, password: string) =>
    git.clone({
      fs: this.fs,
      http,
      dir: this.root,
      url,
      // corsProxy: "https://cors.isomorphic-git.org", // TODO: we probably can't keep using this
      // onAuth: () => ({ username, password }),
    });

  checkout = (branch: string) =>
    git.checkout({ fs: this.fs, dir: this.root, ref: branch });

  commit = () =>
    git.commit({
      fs: this.fs,
      dir: this.root,
      message: "Change file",
      author,
    });

  addFiles = async (folder: string, files: string[]) => {
    for (const filename of files) {
      await git.add({
        fs: this.fs,
        dir: this.root,
        filepath: folder + "/" + filename,
      });
    }
  };

  push = (username: string, password: string) =>
    git.push({
      fs: this.fs,
      dir: this.root,
      http,
      onAuth: () => ({ username, password }),
    });
}

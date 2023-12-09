import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

import git, { HttpClient, PromiseFsClient } from "isomorphic-git";

const author = {
  name: "Mr. Test",
  email: "mrtest@example.com",
};

export default class GitHelper {
  fs: PromiseFsClient;
  root: string;
  http: HttpClient;

  constructor(fs: PromiseFsClient, http: HttpClient, root: string) {
    this.fs = fs;
    this.http = http;
    this.root = root;
  }

  cloneFromGithub = (
    repositoryPath: string,
    username: string,
    password: string
  ) =>
    git.clone({
      fs: this.fs,
      http: this.http,
      dir: this.root,
      url: "https://github.com/" + repositoryPath,
      corsProxy: "https://cors.isomorphic-git.org", // TODO: we probably can't keep using this
      onAuth: () => ({ username, password }),
    });

  clone = (url: string) =>
    git.clone({
      fs: this.fs,
      http: this.http,
      dir: this.root,
      url,
    });

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
      http: this.http,
      onAuth: () => ({ username, password }),
    });
}

import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

import git, { HttpClient, PromiseFsClient } from "isomorphic-git";

export type Auth = { username: string; password: string };

const author = {
  name: "Mr. Test",
  email: "mrtest@example.com",
};

export default class GitHelper {
  fs: PromiseFsClient;
  root: string;
  http: HttpClient;
  auth: Auth | undefined;
  disableCorsProxy: boolean;

  constructor({
    fs,
    http,
    root,
    auth,
    disableCorsProxy,
  }: {
    fs: PromiseFsClient;
    http: HttpClient;
    root: string;
    auth?: Auth;
    disableCorsProxy?: boolean;
  }) {
    this.fs = fs;
    this.http = http;
    this.root = root;
    this.auth = auth;
    this.disableCorsProxy = disableCorsProxy ?? false;
  }

  clone = (url: string) => {
    return git.clone({
      fs: this.fs,
      http: this.http,
      dir: this.root,
      url,
      corsProxy: url.startsWith("http://localhost")
        ? undefined
        : this.disableCorsProxy
        ? undefined
        : "https://cors.isomorphic-git.org", // TODO: we probably can't keep using this
      onAuth: this.auth ? () => this.auth : undefined,
    });
  };

  commit = () =>
    git.commit({
      fs: this.fs,
      dir: this.root,
      message: "Change file",
      author,
    });

  add = async (filepath: string) =>
    git.add({
      fs: this.fs,
      dir: this.root,
      filepath,
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

  push = () =>
    git.push({
      fs: this.fs,
      dir: this.root,
      http: this.http,
      onAuth: this.auth ? () => this.auth : undefined,
    });
}

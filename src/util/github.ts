import { iter } from "but-unzip";

import { Folder, insertIntoFolder } from "./fsHelper";
import { fetchJSON, addCorsProxy } from "./http";

// @param url: URL of a Github repostiory, ie. https://github.com/owner/repo
export const loadViaHttp = async (url: string) => {
  // Note that Github offers 2 ways to retrieve the contents of a repository:
  // 1. Via Github API:
  //     Fetch a full list of files (https://api.github.com/repos/${owner}/${repo}/git/trees/${mainBranch}?recursive=1)
  //     Then fetch each file individually
  // 2. Fetch a zipfile containing the whole repo via codeload.github.com

  // The downside of using 1. is that the Github API has relatively low rate limits for anonymous access (60 requests per hour)
  // and requires authentication for higher limits. This is why we're using method 2. here.

  const match = /https:\/\/github.com\/([^/]+)\/([^/]+)\/?/.exec(url)!;
  if (!match) {
    throw new Error("Invalid URL");
  }
  const [, owner, repo] = match;

  const token = ``;
  const ghHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  // Fetch the default branch of the repository to determine the url of the zip file
  const defaultBranch = (
    await fetchJSON<{ default_branch: string }>(
      `https://api.github.com/repos/${owner}/${repo}`,
      ghHeader
    )
  ).default_branch;

  const repoContents = await fetchJSON<{ contents: string }>(
    addCorsProxy(
      `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${defaultBranch}`
    )
  );

  // api.allorigins.win seems to convert the zip file to JSON containing base64. The string is prefixed with "data:application/zip;base64,"
  const zipFileBase64 = repoContents.contents.replace(
    "data:application/zip;base64,",
    ""
  );

  // Convert from base64 to Uint8Arry (which we'll need for but-unzip)
  // https://stackoverflow.com/a/41106346
  const zipFileUint8Array = Uint8Array.from(atob(zipFileBase64), (c) =>
    c.charCodeAt(0)
  );

  const folder: Folder = {
    files: {},
    folders: {},
  };

  // for (const entry of iter(new Uint8Array(repoContents))) {
  for (const entry of iter(zipFileUint8Array)) {
    if (entry.filename.endsWith("/")) {
      // Skip directories; insertIntoFolder() will add folders as needed
      continue;
    }
    // Github puts all contents in a top-level folder with the repoName-mainBranch
    const path = entry.filename.replace(`${repo}-${defaultBranch}/`, "");
    const uint8Contents = await entry.read();
    const textContents = new TextDecoder().decode(uint8Contents);
    insertIntoFolder(folder, path, textContents);
  }

  return folder;
};

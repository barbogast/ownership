import { BrowserContext, Page } from "@playwright/test";

export const getLocalStorageContent = async (
  context: BrowserContext,
  name: string
) => {
  const storage = await context.storageState();
  const storageContent = storage.origins[0]!.localStorage.find(
    (entry) => entry.name === name
  );
  if (!storageContent) {
    throw new Error(`No localStorage entry found for ${name}`);
  }
  return JSON.parse(storageContent.value);
};

const retrieveValueFromIndexedDB = async ({ path }: { path: string }) => {
  return new Promise((resolve, reject) => {
    const retrieveValue = (db: IDBDatabase) => {
      const txn = db.transaction(["keyval"]);
      const store = txn.objectStore("keyval");
      const query = store.get(path);

      query.onsuccess = () => resolve(query.result);
      query.onerror = reject;
      txn.oncomplete = () => db.close();
    };

    const request = window.indexedDB.open("keyval-store");
    request.onerror = () => reject(`Database error`);

    request.onsuccess = () => {
      const db = request.result;
      retrieveValue(db);
    };
  });
};

export const getIndexedDbContent = async (page: Page, name: string) => {
  const content = await page.evaluate(retrieveValueFromIndexedDB, {
    path: name,
  });
  return content;
};

export const setLocalStorageContent = async (
  page: Page,
  name: string,
  content: unknown
) => {
  await page.addInitScript(
    ({ name, value }) => {
      const isInIframe = window.self !== window.top;

      // Avoid to touch localStorage in iframes.
      // page.addInitScript is executed in iframes as well, and the code-execution iframe
      // doesn't have access to the localStorage.
      if (!isInIframe) {
        window.localStorage.setItem(name, value);
      }
    },
    { name, value: JSON.stringify(content) }
  );
};

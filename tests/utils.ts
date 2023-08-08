import { BrowserContext } from "@playwright/test";

export const getLocalStorageContent = async (
  context: BrowserContext,
  name: string
) => {
  const storage = await context.storageState();
  const storageContent = storage.origins[0].localStorage.find(
    (entry) => entry.name === name
  );
  if (!storageContent) {
    throw new Error(`No localStorage entry found for ${name}`);
  }
  return JSON.parse(storageContent.value);
};

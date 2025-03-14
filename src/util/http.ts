export const fetchJSON = async <T>(
  ...args: Parameters<typeof fetch>
): Promise<T> => {
  const response = await fetch(...args);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${args[0]}: ${response.statusText}`);
  }
  return response.json();
};

export const fetchText = async (
  ...args: Parameters<typeof fetch>
): Promise<string> => {
  const response = await fetch(...args);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${args[0]}: ${response.statusText}`);
  }
  return response.text();
};

export const fetchArrayBuffer = async (
  ...args: Parameters<typeof fetch>
): Promise<ArrayBuffer> => {
  const response = await fetch(...args);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${args[0]}: ${response.statusText}`);
  }
  return response.arrayBuffer();
};

export const addCorsProxy = (url: string) =>
  "https://api.allorigins.win/get?url=" + encodeURIComponent(url);

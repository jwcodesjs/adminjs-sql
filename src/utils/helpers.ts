export const safeParseJSON = (json: string): Record<string, any> | null => {
  try {
    return JSON.parse(json);
  } catch (_error) {
    return null;
  }
};

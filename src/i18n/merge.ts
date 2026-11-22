export type Messages = { [key: string]: string | Messages };

export function deepMerge(english: Messages, translated: Messages): Messages {
  const merged: Messages = { ...english };
  for (const key of Object.keys(english)) {
    const base = english[key];
    const value = translated[key];
    if (typeof base === "string") merged[key] = typeof value === "string" ? value : base;
    else merged[key] = deepMerge(base, value && typeof value === "object" ? value : {});
  }
  return merged;
}

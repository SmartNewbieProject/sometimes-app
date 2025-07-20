export const parseVersionToNumber = (version: string): number => {
  const cleaned = version.replace(/\./g, '');
  return Number(cleaned);
};

export const compareVersions = (currentVersion: string, serverVersion: string): boolean => {
  const currentVersionNum = parseVersionToNumber(currentVersion);
  const serverVersionNum = parseVersionToNumber(serverVersion);

  return serverVersionNum > currentVersionNum;
};
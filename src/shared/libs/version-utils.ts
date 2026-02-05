export const compareVersions = (currentVersion: string, serverVersion: string): boolean => {
  const current = currentVersion.split('.').map(Number);
  const server = serverVersion.split('.').map(Number);

  const maxLength = Math.max(current.length, server.length);

  for (let i = 0; i < maxLength; i++) {
    const c = current[i] ?? 0;
    const s = server[i] ?? 0;

    if (s > c) return true;
    if (s < c) return false;
  }

  return false;
};
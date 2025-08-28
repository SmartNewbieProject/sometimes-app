export const buildChatSocketUrl = (
  baseUrl: string,
  namespace: string = '/chat',
  token?: string,
) => {
  const trimmed = baseUrl.replace(/\/$/, '');
  const ns = namespace.startsWith('/') ? namespace : `/${namespace}`;
  const q = token ? `?token=${encodeURIComponent(token)}` : '';
  return `${trimmed}${ns}${q}`;
};


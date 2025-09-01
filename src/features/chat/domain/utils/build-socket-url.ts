export const buildChatSocketUrl = (baseUrl: string, namespace = '/chat', token?: string | null) => {
	const trimmed = baseUrl.replace(/\/$/, '');
	const ns = namespace.startsWith('/') ? namespace : `/${namespace}`;
	const q = token ? `?token=${encodeURIComponent(token)}` : '';
	return `http://localhost:8044${ns}${q}`;
};

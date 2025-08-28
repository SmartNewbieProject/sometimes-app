export const buildChatSocketUrl = (baseUrl: string, namespace = '/chat', token?: string | null) => {
	const trimmed = baseUrl.replace(/\/$/, '');
	const ns = namespace.startsWith('/') ? namespace : `/${namespace}`;
	const q = token ? `?token=${encodeURIComponent(token)}` : '';
	return `http://52.78.178.66${ns}${q}`;
};

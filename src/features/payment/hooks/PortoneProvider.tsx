import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface PortoneContextValue {
	loaded: boolean;
	error: Error | null;
}

const PortoneContext = createContext<PortoneContextValue>({ loaded: false, error: null });

export function usePortoneScript() {
	return useContext(PortoneContext);
}

interface PortoneProviderProps {
	children: ReactNode;
}

export function PortoneProvider({ children }: PortoneProviderProps) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const { t } = useTranslation();

	useEffect(() => {
		if (typeof window === 'undefined' || window.document === undefined) return;
		if (window.IMP) {
			setLoaded(true);
			return;
		}
		const script = document.createElement('script');
		script.src = 'https://cdn.iamport.kr/v1/iamport.js';
		script.async = true;
		script.onload = () => setLoaded(true);
		script.onerror = () => setError(new Error(t('ui.portone.script_load_failure')));
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return <PortoneContext.Provider value={{ loaded, error }}>{children}</PortoneContext.Provider>;
}

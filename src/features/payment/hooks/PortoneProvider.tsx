import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

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

	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (window.IMP) {
			setLoaded(true);
			return;
		}
		const script = document.createElement('script');
		script.src = 'https://cdn.iamport.kr/v1/iamport.js';
		script.async = true;
		script.onload = () => setLoaded(true);
		script.onerror = () => setError(new Error('Portone(아임포트) 스크립트 로드 실패'));
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return <PortoneContext.Provider value={{ loaded, error }}>{children}</PortoneContext.Provider>;
}

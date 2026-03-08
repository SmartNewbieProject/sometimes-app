import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

type PortalContextType = {
	mount: (key: string, element: React.ReactNode) => void;
	unmount: (key: string) => void;
};

const PortalContext = createContext<PortalContextType | null>(null);

export function usePortal() {
	const context = useContext(PortalContext);
	if (!context) {
		throw new Error('usePortal must be used within a PortalProvider');
	}
	return context;
}

interface PortalProviderProps {
	children: React.ReactNode;
}

export function PortalProvider({ children }: PortalProviderProps) {
	const [portals, setPortals] = useState<Map<string, React.ReactNode>>(new Map());

	const mount = useCallback((key: string, element: React.ReactNode) => {
		setPortals((prev) => {
			const next = new Map(prev);
			next.set(key, element);
			return next;
		});
	}, []);

	const unmount = useCallback((key: string) => {
		setPortals((prev) => {
			const next = new Map(prev);
			next.delete(key);
			return next;
		});
	}, []);

	const contextValue = useMemo(() => ({ mount, unmount }), [mount, unmount]);

	return (
		<PortalContext.Provider value={contextValue}>
			{children}
			{portals.size > 0 && (
				<View style={styles.portalHost} pointerEvents="box-none">
					{Array.from(portals.entries()).map(([key, element]) => (
						<View key={key} style={StyleSheet.absoluteFill} pointerEvents="box-none">
							{element}
						</View>
					))}
				</View>
			)}
		</PortalContext.Provider>
	);
}

interface PortalProps {
	children: React.ReactNode;
	name: string;
}

export function Portal({ children, name }: PortalProps) {
	const { mount, unmount } = usePortal();

	// children이 변할 때마다 mount 업데이트 (unmount 없이)
	// unmount를 cleanup에 넣으면 children 변경 시 언마운트/리마운트 되어 내부 애니메이션이 초기화됨
	React.useEffect(() => {
		mount(name, children);
	}, [name, children, mount]);

	// 컴포넌트 자체가 언마운트될 때만 unmount
	React.useEffect(() => {
		return () => {
			unmount(name);
		};
	}, [name, unmount]);

	return null;
}

const styles = StyleSheet.create({
	portalHost: {
		...StyleSheet.absoluteFillObject,
		zIndex: 9999,
	},
});

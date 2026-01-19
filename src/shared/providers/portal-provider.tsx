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
			<View style={styles.portalHost} pointerEvents="box-none">
				{Array.from(portals.entries()).map(([key, element]) => (
					<View key={key} style={StyleSheet.absoluteFill} pointerEvents="box-none">
						{element}
					</View>
				))}
			</View>
		</PortalContext.Provider>
	);
}

interface PortalProps {
	children: React.ReactNode;
	name: string;
}

export function Portal({ children, name }: PortalProps) {
	const { mount, unmount } = usePortal();

	React.useEffect(() => {
		mount(name, children);
		return () => {
			unmount(name);
		};
	}, [name, children, mount, unmount]);

	return null;
}

const styles = StyleSheet.create({
	portalHost: {
		...StyleSheet.absoluteFillObject,
		zIndex: 9999,
	},
});

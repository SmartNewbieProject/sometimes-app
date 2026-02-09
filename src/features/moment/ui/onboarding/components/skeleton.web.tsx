import React, { useEffect, useRef } from 'react';
import { type DimensionValue, StyleSheet, View, type ViewStyle } from 'react-native';

interface SkeletonProps {
	width: DimensionValue;
	height: number;
	borderRadius?: number;
	style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 8, style }: SkeletonProps) => {
	const viewRef = useRef<View>(null);

	useEffect(() => {
		const node = viewRef.current as unknown as HTMLElement;
		if (node?.style) {
			node.style.animation = 'skeleton-pulse 1.5s ease-in-out infinite';
		}
	}, []);

	return (
		<>
			{/* @ts-ignore - web-only style element */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
            @keyframes skeleton-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
          `,
				}}
			/>
			<View
				ref={viewRef}
				style={[styles.skeleton, { width: width as DimensionValue, height, borderRadius }, style]}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	skeleton: {
		backgroundColor: '#E8E0F0',
	},
});

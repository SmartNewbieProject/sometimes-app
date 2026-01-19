import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { CropOverlayProps } from './types';

const MASK_COLOR = 'rgba(0, 0, 0, 0.6)';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.8)';
const GRID_COLOR = 'rgba(255, 255, 255, 0.3)';

export function CropOverlay({ cropSize, containerSize }: CropOverlayProps) {
	const horizontalMask = (containerSize.width - cropSize) / 2;
	const verticalMask = (containerSize.height - cropSize) / 2;

	return (
		<View style={styles.container} pointerEvents="none">
			{/* Top mask */}
			<View style={[styles.mask, { height: verticalMask }]} />

			{/* Middle row */}
			<View style={styles.middleRow}>
				{/* Left mask */}
				<View style={[styles.mask, { width: horizontalMask, height: cropSize }]} />

				{/* Crop area */}
				<View style={[styles.cropArea, { width: cropSize, height: cropSize }]}>
					{/* Border */}
					<View style={styles.border} />

					{/* 3x3 Grid */}
					<View style={styles.gridContainer}>
						{/* Horizontal lines */}
						<View style={[styles.gridLineHorizontal, { top: cropSize / 3 }]} />
						<View style={[styles.gridLineHorizontal, { top: (cropSize * 2) / 3 }]} />

						{/* Vertical lines */}
						<View style={[styles.gridLineVertical, { left: cropSize / 3 }]} />
						<View style={[styles.gridLineVertical, { left: (cropSize * 2) / 3 }]} />
					</View>

					{/* Corner indicators */}
					<View style={[styles.corner, styles.cornerTopLeft]} />
					<View style={[styles.corner, styles.cornerTopRight]} />
					<View style={[styles.corner, styles.cornerBottomLeft]} />
					<View style={[styles.corner, styles.cornerBottomRight]} />
				</View>

				{/* Right mask */}
				<View style={[styles.mask, { width: horizontalMask, height: cropSize }]} />
			</View>

			{/* Bottom mask */}
			<View style={[styles.mask, { height: verticalMask }]} />
		</View>
	);
}

const CORNER_SIZE = 20;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
	},
	mask: {
		backgroundColor: MASK_COLOR,
	},
	middleRow: {
		flexDirection: 'row',
	},
	cropArea: {
		position: 'relative',
	},
	border: {
		...StyleSheet.absoluteFillObject,
		borderWidth: 1,
		borderColor: BORDER_COLOR,
	},
	gridContainer: {
		...StyleSheet.absoluteFillObject,
	},
	gridLineHorizontal: {
		position: 'absolute',
		left: 0,
		right: 0,
		height: 1,
		backgroundColor: GRID_COLOR,
	},
	gridLineVertical: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		width: 1,
		backgroundColor: GRID_COLOR,
	},
	corner: {
		position: 'absolute',
		width: CORNER_SIZE,
		height: CORNER_SIZE,
	},
	cornerTopLeft: {
		top: -1,
		left: -1,
		borderTopWidth: CORNER_THICKNESS,
		borderLeftWidth: CORNER_THICKNESS,
		borderColor: '#FFFFFF',
	},
	cornerTopRight: {
		top: -1,
		right: -1,
		borderTopWidth: CORNER_THICKNESS,
		borderRightWidth: CORNER_THICKNESS,
		borderColor: '#FFFFFF',
	},
	cornerBottomLeft: {
		bottom: -1,
		left: -1,
		borderBottomWidth: CORNER_THICKNESS,
		borderLeftWidth: CORNER_THICKNESS,
		borderColor: '#FFFFFF',
	},
	cornerBottomRight: {
		bottom: -1,
		right: -1,
		borderBottomWidth: CORNER_THICKNESS,
		borderRightWidth: CORNER_THICKNESS,
		borderColor: '#FFFFFF',
	},
});

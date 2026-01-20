export type VersionSupportPlatform = 'ios' | 'android' | 'web';

export interface VersionUpdateResponse {
	id: string;
	version: string;
	metadata: {
		description: string[];
		supports: VersionSupportPlatform[];
	};
	shouldUpdate: boolean;
}

export interface VersionCompareResult {
	needsUpdate: boolean;
	latestVersion: string;
	currentVersion: string;
	updateData: VersionUpdateResponse;
}

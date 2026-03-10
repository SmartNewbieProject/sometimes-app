export interface ClusterUniversity {
	id: string;
	name: string;
	code: string;
	matchCount: number;
}

export interface RegionStats {
	region: string;
	matchCount: number;
	weeklyNew: number;
	clusterUniversities: ClusterUniversity[];
}

export const FALLBACK_TOTAL_COUPLES = 12847;

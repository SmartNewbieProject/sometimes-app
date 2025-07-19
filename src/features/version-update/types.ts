export interface VersionUpdateResponse {
  id: string;
  version: string;
  metadata: {
    description: string[];
  };
  shouldUpdate: boolean;
}

export interface VersionCompareResult {
  needsUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  updateData: VersionUpdateResponse;
}
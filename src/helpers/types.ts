export interface DependencyOutput {
  id: string;
  groupId?: string;
  artifactId?: string;
  name: string;
  version: string;
  issues: string[];
  issuesCount: number;
  contributors: number;
  pullRequests: number;
  projectUrl: string;
  issuesUrl: string;
  readme: {
    base64: string;
    downloadUrl: string;
  };
  stars: number;
  watchers: number;
  forks: number;
  githubLicenseName?: string;
  description?: string;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  monthsSinceUpdated: number;
  npmLicenseCheck?: string;
  usedIn?: string[];
  versionsBehind?: {
    text: string;
    patch: number;
    minor: number;
    major: number;
  };
  outdated?: {
    current: string;
    wanted: string;
    latest: string;
    location: string;
  };
  missingFrom?: string[];
}

export interface PackageMetaInformation {
  NPM:
    | {
        packages: DependencyOutput[];
        licenses: string[];
      }
    | undefined;
  POM:
    | {
        packages: DependencyOutput[];
        licenses: string[];
      }
    | undefined;
  date: string;
}

import GitHost, { fromUrl } from "hosted-git-info";
import { Utils } from "./utils";
import got from "got";

const MAX_ISSUES_TO_PULL = 100;
const MAX_CONCURRENT_REQUESTS = 10;
const headers =
  (process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }) ||
  undefined;

export interface LoadIssuesInput {
  url?: string;
  name?: string;
  version?: string;
}

interface GithubInformationOutput {
  stars: number;
  watchers: number;
  forks: number;
  githubLicenseName: string;
  description: string;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
}

interface ReadmeOuput {
  base64: string;
  downloadUrl: string;
}

interface PackagesOutput {
  id: string;
  name: string;
  version: string;
  issues: string;
  issuesCount: number;
  contributors: number;
  pullRequests: number;
  projectUrl: string;
  issuesUrl: string;
  readme: ReadmeOuput;
  monthsSinceUpdated: number;
}

type IssuesLoader = PackagesOutput & GithubInformationOutput;

export const Github = (() => {
  async function getOpenIssues(info: GitHost) {
    const githubUrl = `https://api.github.com/repos/${info.user}/${info.project}/issues?per_page=${MAX_ISSUES_TO_PULL}`;

    try {
      const res = await got.get(githubUrl, { headers }).json<any>();

      const issues = res.filter(
        (issue: any) => !issue.hasOwnProperty("pull_request")
      );
      return issues;
    } catch (error) {
      return [];
    }
  }

  async function getContributors(info: GitHost) {
    const githubUrl = `https://api.github.com/repos/${info.user}/${info.project}/contributors?per_page=1&anon=true`;

    const res = await got.get(githubUrl, { headers });

    if (res.statusCode === 403) {
      throw new Error("Github rate limited");
    }

    const lastLinkHeader = String(res.headers.link).split(";")[1];

    if (!lastLinkHeader) {
      return 0;
    }

    const contributors = Number(
      lastLinkHeader.substring(
        lastLinkHeader.lastIndexOf("anon=true&page=") + 15,
        lastLinkHeader.lastIndexOf(">")
      )
    );

    return contributors;
  }

  async function getPullRequests(info: GitHost) {
    const githubUrl = `https://api.github.com/repos/${info.user}/${info.project}/pulls?per_page=1&anon=true`;

    const res = await got.get(githubUrl, { headers });

    if (res.statusCode === 403) {
      throw new Error("Github rate limited");
    }

    const lastLinkHeader = String(res.headers.link).split(";")[1];

    if (!lastLinkHeader) {
      return 0;
    }

    const pulls = Number(
      lastLinkHeader.substring(
        lastLinkHeader.lastIndexOf("anon=true&page=") + 15,
        lastLinkHeader.lastIndexOf(">")
      )
    );

    return pulls;
  }

  async function getReadmeFile(info: GitHost): Promise<ReadmeOuput> {
    const githubUrl = `https://api.github.com/repos/${info.user}/${info.project}/readme`;
    const res = await got.get(githubUrl, { headers }).json<any>();

    if (res.statusCode === 403) {
      throw new Error("Github rate limited");
    }

    try {
      return {
        base64: res.content,
        downloadUrl: res.git_url,
      };
    } catch (error) {
      throw Error("Could not parse readme");
    }
  }

  async function getGithubInfo(
    info: GitHost
  ): Promise<GithubInformationOutput> {
    const githubUrl = `https://api.github.com/repos/${info.user}/${info.project}`;
    const res = await got.get(githubUrl, { headers }).json<any>();

    if (res.statusCode === 403) {
      throw new Error("Github rate limited");
    }

    return {
      stars: res.stargazers_count,
      watchers: res.watchers_count,
      forks: res.forks_count,
      githubLicenseName: res.license?.spdx_id,
      description: res.description,
      openIssues: res.open_issues,
      createdAt: res.created_at,
      updatedAt: res.updated_at,
    };
  }

  async function getIssues(packageJsonLocations: LoadIssuesInput[]) {
    const packagesInformation = [];
    for await (const p of loadIssues(packageJsonLocations)) {
      packagesInformation.push(p);
    }
    return packagesInformation;
  }

  async function* loadIssues(
    packages: LoadIssuesInput[]
  ): AsyncGenerator<IssuesLoader | undefined> {
    for (const chunk of Utils.chunksOfSize(packages, MAX_CONCURRENT_REQUESTS)) {
      const promises = chunk.map(async (pack) => {
        try {
          const info = fromUrl(pack.url);

          if (!info || info.type !== "github") {
            return undefined;
          }

          const promises = [
            getOpenIssues(info),
            getGithubInfo(info),
            getContributors(info),
            getPullRequests(info),
          ];

          const [
            issues,
            GHInformation,
            contributors,
            pullRequests,
          ] = await Promise.all(promises);

          return {
            id: `${pack.name}@${pack.version}`,
            name: pack.name,
            version: pack.version,
            issues,
            issuesCount: issues.length,
            contributors,
            pullRequests,
            projectUrl: `https://github.com/${info.user}/${info.project}`,
            issuesUrl: `https://github.com/${info.user}/${info.project}/issues`,
            ...GHInformation,
            monthsSinceUpdated: Utils.getMonthsUntilToday(
              GHInformation.updatedAt
            ),
          };
        } catch (error) {
          console.log(error);
          return;
        }
      });

      for (const promise of promises) {
        yield await promise;
      }
    }
  }

  return Object.freeze({
    getIssues,
    getOpenIssues,
    getGithubInfo,
    getContributors,
    getPullRequests,
    getReadmeFile,
  });
})();

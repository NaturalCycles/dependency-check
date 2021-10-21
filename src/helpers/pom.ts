import { exec } from "child_process";
import * as pomParser from "pom-parser";
import got from "got";
import { Utils } from "./utils";
import { toJson } from "xml2json";
import { fromUrl } from "hosted-git-info";
import { Github } from "./github";
import { DependencyOutput } from "./types";

const MAX_CONCURRENT_REQUESTS = 10;

interface ParsedPomDependency {
  groupid: string;
  artifactid: string;
  version: string;
  scope?: string;
}

interface PomObject {
  project: {
    xmlns: string;
    "xmlns:xsi": string;
    "xsi:schemaLocation": string;
    modelversion: string;
    packaging: string;
    version: string;
    groupid: string;
    artifactid: string;
    properties: Record<string, string>;
    dependencies: {
      dependency: ParsedPomDependency[];
    };
    build: Record<string, any>;
    reporting: Record<string, any>;
  };
}

interface ParsedPomXML {
  id?: string;
  groupId?: string;
  artifactId?: string;
  version?: string;
  name?: string;
  description?: string;
  licenses?: {
    license: {
      name?: string;
      url?: string;
      distribution?: string;
    };
  };
  github?: string;
}

export const Pom = (() => {
  async function locatePomXML(): Promise<string[]> {
    return await new Promise(async (resolve, reject) => {
      const directory = await Utils.getCurrentDirectory();
      exec(`find ${directory} -type f -name "pom.xml"`, (err, stdout) => {
        if (stdout) {
          const paths = stdout
            .split("\n")
            .filter((path) => path && path !== "");

          resolve(paths);
        } else {
          resolve([]);
        }
      });
    });
  }

  async function parsePom(path: string): Promise<PomObject> {
    return await new Promise(async (resolve, reject) => {
      pomParser.parse(
        {
          filePath: path,
        },
        function (err: Error, pomResponse: any) {
          if (err) {
            reject(err);
          }
          resolve(pomResponse.pomObject);
        }
      );
    });
  }

  async function getDependenciesVersions(
    pomPaths: string[]
  ): Promise<Record<string, ParsedPomDependency>> {
    const dependencies = [];

    for (const pomPath of pomPaths) {
      const parsedPom = await parsePom(pomPath);
      const properties = parsedPom.project.properties;

      const parsedDependencies = parsedPom.project.dependencies.dependency.map(
        (dependency) => {
          const version = dependency.version;
          if (version.includes("${")) {
            const envPropertyName = version.substring(
              version.lastIndexOf("${") + 2,
              version.lastIndexOf("}")
            );

            dependency.version = properties[envPropertyName]!;
          }
          return dependency;
        }
      );
      dependencies.push(...parsedDependencies);
    }

    return dependencies.reduce(
      (reducer: Record<string, ParsedPomDependency>, dependency) => {
        reducer[`${dependency.artifactid}@${dependency.version}`] = dependency;
        return reducer;
      },
      {}
    );
  }

  async function getPomFromCentral(
    dependency: ParsedPomDependency
  ): Promise<ParsedPomXML> {
    const splitedGroup = dependency.groupid.split(".").join("/");
    const url = `https://search.maven.org/classic/remotecontent?filepath=${splitedGroup}/${dependency.artifactid}/${dependency.version}/${dependency.artifactid}-${dependency.version}.pom`;

    try {
      const res = await got.get(url);
      const parsedInformation = JSON.parse(toJson(res.body));
      const version =
        parsedInformation.project?.version ||
        parsedInformation.project?.parent?.version;
      return {
        id: `${parsedInformation.project?.artifactId}@${version}`,
        groupId: parsedInformation.project?.groupId,
        artifactId: parsedInformation.project?.artifactId,
        version: version,
        name: parsedInformation.project?.name,
        description: parsedInformation.project?.description,
        licenses: parsedInformation.project?.licenses,
        github: parsedInformation.project?.scm?.url,
      };
    } catch (error) {
      console.log(url);
      console.log(dependency);
      console.log(error);
      throw new Error(`Unable to get POM for ${dependency.artifactid}`);
    }
  }

  async function getLatestFromCentral(
    dependency: ParsedPomDependency
  ): Promise<string | undefined> {
    const url = `https://search.maven.org/solrsearch/select?q=g:%22${dependency.groupid}%22+AND+a:%22${dependency.artifactid}%22&core=gav&rows=20&wt=json`;

    try {
      const info = await got.get(url).json<any>();
      return info?.response?.docs[0]?.v;
    } catch (error) {
      console.log(url);
      console.log(dependency);
      console.log(error);
      throw new Error(`Unable to get Latest for ${dependency.artifactid}`);
    }
  }

  async function* getDependenciesInformation(
    dependencies: Record<string, ParsedPomDependency>
  ): AsyncGenerator<any | undefined> {
    for (const chunk of Utils.chunksOfSize(
      Object.keys(dependencies),
      MAX_CONCURRENT_REQUESTS
    )) {
      const promises = chunk.map(async (packageId) => {
        const parsedPackage = dependencies[packageId]!;
        const mavenInformation = await getPomFromCentral(parsedPackage);
        const latestVersion = await getLatestFromCentral(parsedPackage);
        const info =
          mavenInformation.github && fromUrl(mavenInformation.github);

        const issues = info && (await Github.getOpenIssues(info));
        const GHInformation = info && (await Github.getGithubInfo(info));
        const contributors = info && (await Github.getContributors(info));
        const pullRequests = info && (await Github.getPullRequests(info));

        return {
          ...mavenInformation,
          latestVersion: latestVersion,
          issues,
          issuesCount: issues && issues.length,
          contributors,
          pullRequests,
          projectUrl: info && `https://github.com/${info.user}/${info.project}`,
          issuesUrl:
            info && `https://github.com/${info.user}/${info.project}/issues`,
          ...GHInformation,
          monthsSinceUpdated:
            GHInformation && Utils.getMonthsUntilToday(GHInformation.updatedAt),
        };
      });

      for (const promise of promises) {
        yield await promise;
      }
    }
  }

  async function getInformation(
    dependencies: Record<string, ParsedPomDependency>
  ): Promise<DependencyOutput[]> {
    const packagesInformation = [];
    for await (const p of getDependenciesInformation(dependencies)) {
      if (p && p.github) {
        packagesInformation.push(p);
      }
    }
    return packagesInformation;
  }

  async function getDependencies(): Promise<DependencyOutput[] | undefined> {
    const pomPaths = await locatePomXML();
    if (pomPaths.length === 0) {
      return;
    }
    const depVersions = await getDependenciesVersions(pomPaths);
    const information = await getInformation(depVersions);
    return information;
  }

  return Object.freeze({ getDependencies });
})();

import { exec } from "child_process";
import { Github, LoadIssuesInput } from "./github";
import { DependencyOutput } from "./types";
import { Utils } from "./utils";

interface PackageJSONType {
  name?: string;
  repository?:
    | string
    | {
        url?: string;
      };
  homepage?: string;
  bugs?:
    | string
    | {
        url: string;
      };
  version: string;
}

export const Npm = (() => {
  async function locatePackageJson(depth?: number): Promise<string[]> {
    const depthParam =
      typeof depth === "number" ? `--depth=${depth}` : `--depth=0`;
    return await new Promise((resolve, reject) => {
      exec(`npm ls --parseable ${depthParam}`, (err, stdout) => {
        const packages = stdout
          .trim()
          .split("\n")
          .map((path) => {
            if (path && path !== "") {
              return `${path}/package.json`;
            }
            return path;
          });

        if (packages && packages.length) {
          const filteredPackages = packages.filter(
            (p) => !!p && p !== "/package.json" && p !== ""
          );

          resolve(filteredPackages);
        } else {
          reject(new Error("Unable to detect dependencies"));
        }
      });
    });
  }

  async function getOutdatedDependencies(): Promise<any> {
    return await new Promise((resolve, reject) => {
      exec(`npm outdated --json`, (err, stdout) => {
        if (stdout) {
          resolve(JSON.parse(stdout));
        } else {
          reject(new Error("Unable to detect dependencies"));
        }
      });
    });
  }

  function parsePackageJson(packageJsonLocations: string[]): LoadIssuesInput[] {
    const packageJsonInfo = packageJsonLocations.reduce<LoadIssuesInput[]>(
      (reducer, path) => {
        try {
          const json: PackageJSONType = require(path);
          let { name, repository, version, homepage, bugs } = json;
          // Not all package.json files include a `name`, fall back to `path`

          const url =
            (typeof repository === "string" ? repository : repository?.url) ||
            homepage ||
            (typeof bugs === "string" ? bugs : bugs?.url);

          name = name || path;

          if (!name || !url) {
            return reducer;
          }

          reducer.push({
            name,
            version,
            url,
          });
        } finally {
          return reducer;
        }
      },
      []
    );

    return packageJsonInfo;
  }

  async function getDependencies(): Promise<DependencyOutput[] | undefined> {
    const packageJsonLocations = await locatePackageJson();
    if (packageJsonLocations.length === 0) {
      return;
    }
    const packagesInformation = parsePackageJson(packageJsonLocations);
    const gitHubInformation = await Github.getIssues(packagesInformation);
    const npmLicenses = await Utils.getLicensesWithChecker();
    const outdatedDependencies = await getOutdatedDependencies();
    const utilizationReport = await Utils.getUtilizationReport();
    const packages = Utils.includeLicensesVersionAndUtilization(
      gitHubInformation,
      npmLicenses,
      outdatedDependencies,
      utilizationReport
    );

    return packages;
  }

  return Object.freeze({ getDependencies });
})();

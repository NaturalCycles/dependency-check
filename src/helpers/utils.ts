import { exec } from "child_process";
import depcheck from "depcheck";

export const Utils = (() => {
  function getAvailableLicenses(packages: any): string[] {
    const licenses = packages.reduce((reducer: any, p: any) => {
      if (!reducer.includes(p.npmLicenseCheck) && p.npmLicenseCheck) {
        reducer.push(p.npmLicenseCheck);
        return reducer;
      }

      if (!reducer.includes(p.githubLicenseName) && p.githubLicenseName) {
        reducer.push(p.githubLicenseName);
        return reducer;
      }
      return reducer;
    }, []);

    return licenses;
  }

  function castNumber(num: string) {
    return Number(num);
  }

  function calcVersionDiff(latest: number, project: number) {
    if (latest < 0 || project < 0) return -1;
    return Math.max(latest - project, 0);
  }

  function versionsBehind(projectVersion: string, latest: string) {
    try {
      const currentProjectVersion = projectVersion.replace(/[\^~]/g, "");

      const [currentMajor, currentMinor, currentPatch] =
        currentProjectVersion.split(".");

      const currentVersionBreakdown = {
        major: castNumber(currentMajor),
        minor: castNumber(currentMinor),
        patch: castNumber(currentPatch),
      };

      const latestVersion = latest.replace(/[\^~]/g, "");
      const [latestMajor, latestMinor, latestPatch] = latestVersion.split(".");

      const mostRecentReleaseBreakdown = {
        major: castNumber(latestMajor),
        minor: castNumber(latestMinor),
        patch: castNumber(latestPatch),
      };

      const versionsBehind = {
        major: calcVersionDiff(
          mostRecentReleaseBreakdown.major,
          currentVersionBreakdown.major
        ),
        minor: calcVersionDiff(
          mostRecentReleaseBreakdown.minor,
          currentVersionBreakdown.minor
        ),
        patch: calcVersionDiff(
          mostRecentReleaseBreakdown.patch,
          currentVersionBreakdown.patch
        ),
      };

      let text = "";
      if (
        versionsBehind.major === 0 &&
        versionsBehind.minor === 0 &&
        versionsBehind.patch === 0
      ) {
        text = "Up to date";
      } else {
        if (versionsBehind.major > 0) {
          text = `${versionsBehind.major} major${
            versionsBehind.major === 1 ? "" : "s"
          }`;
        } else if (versionsBehind.minor > 0) {
          text = `${versionsBehind.minor} minor${
            versionsBehind.minor === 1 ? "" : "s"
          }`;
        } else if (versionsBehind.patch > 0) {
          text = `${versionsBehind.patch} patch${
            versionsBehind.patch === 1 ? "" : "es"
          }`;
        } else {
          text = "Unknown";
        }
      }

      return { ...{ text: text.trim() }, ...versionsBehind };
    } catch (e) {
      return {
        text: "Unknown",
        major: -1,
        minor: -1,
        patch: -1,
      };
    }
  }

  async function getCurrentDirectory(): Promise<string> {
    return await new Promise((resolve, reject) => {
      exec(`echo $PWD`, (err, stdout) => {
        if (stdout) {
          resolve(String(stdout.trim()));
        } else {
          reject(new Error("Unable to get current directory"));
        }
      });
    });
  }

  function includeLicensesVersionAndUtilization(
    packagesInformation: any,
    npmLicenses: any,
    outdatedDependencies: any,
    utilizationReport: any
  ) {
    return packagesInformation
      .map((p: any) => {
        if (!p) {
          return;
        }
        if (p.id && npmLicenses[p.id]) {
          p["npmLicenseCheck"] = npmLicenses[p.id].licenses;
        }

        if (p.name && outdatedDependencies[p.name]) {
          p["outdated"] = outdatedDependencies[p.name];
          p["versionsBehind"] = versionsBehind(
            p.outdated.current,
            p.outdated.latest
          );
        }

        if (p.name && utilizationReport.using[p.name]) {
          p["usedIn"] = utilizationReport.using[p.name];
        }

        if (p.name && utilizationReport.missing[p.name]) {
          p["missingFrom"] = utilizationReport.missing[p.name];
        }

        return p;
      })
      .filter((p: any) => p && !!p.id);
  }

  function chunksOfSize(arr: any[], size: number): any[][] {
    return arr.reduce((chunks, el, i) => {
      const chunkIdx = Math.floor(i / size);
      if (!chunks[chunkIdx]) {
        chunks[chunkIdx] = [];
      }
      chunks[chunkIdx].push(el);
      return chunks;
    }, Array(Math.ceil(arr.length / size)));
  }

  function getMonthsUntilToday(date: string): number {
    const date1 = new Date();
    const date2 = new Date(date);
    const yearsDiff = date2.getFullYear() - date1.getFullYear();
    const months = Math.abs(
      yearsDiff * 12 + (date2.getMonth() - date1.getMonth())
    );

    return months;
  }

  async function getUtilizationReport(): Promise<depcheck.Results> {
    const projectPath = await getCurrentDirectory()
    return await depcheck(projectPath, { skipMissing: true });
  }

  async function getLicensesWithChecker() {
    return await new Promise((resolve, reject) => {
      exec(`npx license-checker --json`, (err, stdout) => {
        if (stdout) {
          resolve(JSON.parse(stdout));
        } else {
          reject(new Error("Unable to detect dependencies"));
        }
      });
    });
  }

  return Object.freeze({
    getAvailableLicenses,
    includeLicensesVersionAndUtilization,
    chunksOfSize,
    getMonthsUntilToday,
    getLicensesWithChecker,
    getUtilizationReport,
    getCurrentDirectory,
  });
})();

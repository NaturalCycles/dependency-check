#!/usr/bin/env node
/**
 * Based on two libraries
 * Original Source Code:
 * Shoulders: https://github.com/mjswensen/shoulders
 * DepChecker: https://github.com/ryanjyost/depchecker
 *
 * Read: https://depchecker.com/blog/analyze-project-deps/
 */
import { runScript } from "@naturalcycles/nodejs-lib/dist/script";
import { Pdf } from "./helpers/pdf";
import { Npm } from "./helpers/npm";
import { Pom } from "./helpers/pom";
import { PackageMetaInformation } from "./helpers/types";
import { Utils } from "./helpers/utils";
import { existsSync, readFileSync } from "fs";
import yargs from "yargs/yargs"

runScript(async () => {
  console.info("RUNNING DEPENCENCY CHECK...");
  const argv = yargs(process.argv.slice(2)).options({
    pdf: { type: "boolean", default: true },
    pdfName: { type: "string", default: "analysis" },
    html: { type: "boolean", default: false },
    skipCache: { type: "boolean", default: false },
    summary: { type: "boolean", default: false },
    only: { type: "array", default: [] },
  }).argv;

  const callerDirectory = await Utils.getCurrentDirectory();
  const cachePath = `${callerDirectory}/.nc-depcheck`;
  const cacheFile = `${cachePath}/output.json`;

  if (!existsSync(`${callerDirectory}/package.json`)) {
    throw new Error(
      "No package.json found. Make sure that you are on the root folder of your project."
    );
  }

  if (existsSync(cachePath) && existsSync(cacheFile) && !argv.skipCache) {
    console.info("BUILDING FROM CACHE...");
    let meta: PackageMetaInformation;

    try {
      const rawCache = readFileSync(cacheFile, "utf-8");
      meta = JSON.parse(rawCache);
    } catch (error) {
      throw new Error(
        `The cache file could not be parsed. Try removing it from ${cacheFile} and try again`
      );
    }

    return await Pdf.generate(meta, {
      pdf: argv.pdf,
      pdfName: argv.pdfName,
      html: argv.html,
      summary: argv.summary,
      only: argv.only,
    });
  }

  const [PomPackages, NpmPackages] = await Promise.all([
    Pom.getDependencies(),
    Npm.getDependencies(),
  ]);

  if (!PomPackages) {
    console.warn("Project has no JAVA dependencies");
  }

  if (!NpmPackages) {
    console.warn("Project has no JS dependencies");
  }

  const meta: PackageMetaInformation = {
    NPM: NpmPackages && {
      packages: NpmPackages,
      licenses: Utils.getAvailableLicenses(NpmPackages),
    },
    POM: PomPackages && {
      packages: PomPackages,
      licenses: Utils.getAvailableLicenses(PomPackages),
    },
    date: new Date().toISOString(),
  };

  return await Pdf.generate(meta, {
    pdf: argv.pdf,
    pdfName: argv.pdfName,
    html: argv.html,
    summary: argv.summary,
    only: argv.only,
  });
});

import { spawn, exec } from "child_process";
import { Utils } from "./utils";
import { resolve as pathResolve } from "path";
import { PackageMetaInformation } from "./types";
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from "fs";
import { launch } from "puppeteer";

function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

interface GenerateSite {
  pdf: boolean;
  html: boolean;
}

export const Gatsby = (() => {
  async function generateSite(
    meta: PackageMetaInformation,
    { pdf, html }: GenerateSite
  ): Promise<any> {
    const callerDirectory = await Utils.getCurrentDirectory();
    const libraryPath = pathResolve(__dirname, "../../");
    const cachePath = `${callerDirectory}/.NCache`;
    const outputDir = `${callerDirectory}/NCPublic`;

    if (!existsSync(cachePath)) {
      mkdirSync(cachePath);
    }

    const cachedOutput = JSON.stringify(meta);
    // Write cached JSON to project
    writeFileSync(`${cachePath}/output.json`, cachedOutput);
    // Write cached JSON to Library to compile Gatsby site
    writeFileSync(`${libraryPath}/content/output.json`, cachedOutput);

    return await new Promise((resolve, reject) => {
      console.log("...GENERATING SITE");
      const sp = spawn(`npx`, ["gatsby", "build"], {
        cwd: libraryPath,
        env: {
          ...process.env,
          BASE64DEPCHECK: meta?.NPM?.licenses[0] || "",
        },
      });

      sp.stdout.on("data", (message) => {
        // console.info(message.toString());
      });

      sp.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
        reject(new Error("Unable to build the site"));
      });

      sp.on("close", async (code) => {
        if (code !== 0) {
          throw new Error("Could not generate Gatsby site");
        }

        if (existsSync(outputDir)) {
          rmdirSync(outputDir, { recursive: true });
        }

        if (pdf) {
          await generatePDF(libraryPath, pathResolve(outputDir, "../"));
        }

        if (html) {
          exec(
            `cp -R ${libraryPath}/public  ${outputDir}`,
            (error, stdout, stderr) => {
              if (error) {
                console.log(`error: ${error.message}`);
                reject(false);
                return;
              }
              if (stderr) {
                console.log(`stderr: ${stderr}`);
                reject(false);
                return;
              }
              console.log(`Site generated: ${outputDir}`);
              return resolve(true);
            }
          );
        }
      });
    });
  }

  async function generatePDF(libraryPath: string, outputDir: string) {
    return await new Promise((resolve, reject) => {
      const sp = spawn(`npx`, ["gatsby", "serve"], {
        cwd: libraryPath,
      });
      sp.stdout.on("data", async (message) => {
        if (message.toString().includes("http://localhost")) {
          console.log("...GENERATING PDF");
          const browser = await launch();
          const page = await browser.newPage();
          await page.setViewport({ width: 2529, height: 1250 });
          await page.goto("http://localhost:9000/", {
            waitUntil: "networkidle2",
          });

          // TODO: remove this and await for dom element
          await delay(3000);

          await page.pdf({
            path: `${outputDir}/analysis.pdf`,
            printBackground: true,
          });
          await browser.close();
          sp.kill("SIGHUP");
          console.log(`PDF generated: ${outputDir}/analysis.pdf`);
          resolve(true);
        }
      });

      sp.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
        reject(new Error("Unable to generate PDF"));
      });
    });
  }

  return Object.freeze({ generateSite });
})();

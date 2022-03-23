import { Utils } from "./utils";
import { resolve as pathResolve } from "path";
import { PackageMetaInformation } from "./types";
import { existsSync, mkdirSync, createWriteStream, writeFileSync } from "fs";
import PDFDocument from "pdfkit";
import { Content } from "../pages/components/Content";

interface GenerateSite {
  pdf: boolean;
  pdfName: string;
  html: boolean;
  summary: boolean;
  only?: string[];
}

export const Pdf = (() => {
  async function generate(
    meta: PackageMetaInformation,
    { pdfName, summary, only }: GenerateSite
  ): Promise<any> {
    const callerDirectory = await Utils.getCurrentDirectory();
    const cachePath = `${callerDirectory}/.nc-depcheck`;
    const outputDir = `${callerDirectory}/nc-depcheckPublic`;

    if (!existsSync(cachePath)) {
      mkdirSync(cachePath);
    }

    const cachedOutput = JSON.stringify(meta);
    // Write cached JSON to project
    writeFileSync(`${cachePath}/output.json`, cachedOutput);

    return await new Promise(async (resolve, reject) => {
      console.log("...GENERATING PDF");
      const pdfPath = `${pathResolve(outputDir, "../")}/${pdfName}.pdf`;

      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        autoFirstPage: true,
      });
      const stream = doc.pipe(createWriteStream(pdfPath));

      stream.on("finish", async () => {
        console.log("PDF generated");
        return resolve(true);
      });

      await Content({
        packageData: meta,
        filterPackages: only?.length ? only : ["*"],
        doc,
      });

      doc.end();
    });
  }
  
  return Object.freeze({ generate });
})();

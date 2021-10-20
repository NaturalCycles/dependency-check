import { DependencyOutput } from "../../helpers/types";
import { Issue } from "./Issue";

export const Issues = async ({
  Data,
  filterPackages,
  doc,
}: {
  Data:
    | {
        packages: DependencyOutput[];
        licenses: string[];
      }
    | undefined;
  filterPackages: string[];
  doc: PDFKit.PDFDocument;
}) => {
  for (const pck of Data?.packages!) {
    if (
      filterPackages.some((packageName) =>
        pck.name.toLowerCase().includes(packageName)
      ) ||
      filterPackages.includes("*")
    ) {

        doc.moveDown(2)
        doc.fontSize(11).fillColor('black');
        doc.text(pck?.issues?.length ? pck.name : "", 40, undefined, {
            align: 'center'
        });
        doc.moveDown(2)

      if (pck?.issues?.length) {
        for (const issue of pck.issues) {
          await Issue({ issue, doc });
        }
      }
    }
  }
};

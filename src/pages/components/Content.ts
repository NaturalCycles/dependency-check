import { PackageMetaInformation } from "../../helpers/types";
import { Index } from "./Index";
import { Issues } from "./Issues";

export const Content = async ({
  packageData,
  filterPackages,
  doc,
}: {
  packageData: PackageMetaInformation;
  filterPackages: string[];
  doc: PDFKit.PDFDocument;
}) => {
  doc.fontSize(13).fillColor('#590248');
  doc.text('SOUP — analysis!')
  doc.moveDown(1)

  Index({Data: packageData.NPM, filterPackages, doc})
  Index({Data: packageData.POM, filterPackages, doc})

  doc.addPage()

  await Issues({Data: packageData.NPM, filterPackages, doc})
  await Issues({Data: packageData.POM, filterPackages, doc}) 
};

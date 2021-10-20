import { PackageMetaInformation } from "../../helpers/types";
import { Index } from "./Index";
import { Issues } from "./Issues";

const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
  color: "#A6A6A6",
};
const headingAccentStyles = {
  color: "#71235D",
};

const listStyles = {
  marginTop: 100,
  marginBottom: 50,
  paddingLeft: 0,
};

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

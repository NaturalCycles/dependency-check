import { DependencyOutput } from "../../helpers/types";

export const Index = ({
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
  Data?.packages.forEach((pck: any) => {
    if (
      filterPackages.some((packageName) =>
        pck.name.toLowerCase().includes(packageName)
      ) ||
      filterPackages.includes("*")
    ) {
      doc.moveDown(2);
      doc.fontSize(11).fillColor("black");
      doc.text(pck?.issues?.length ? pck.name : "", 40);
      doc.moveDown(2);

      doc.fontSize(10).fillColor("grey");
      pck.issues?.forEach((issue: any) => {
        doc
          .text(issue.title, 70, undefined, {
            // link: issue.id,
            lineBreak: true,
            align: "left",
          })
          .goTo(70, doc.y - 20, 500, 20, issue.id, {
            Name: issue.id,
          });
        doc.moveDown(1);
      });
    }
  });
};

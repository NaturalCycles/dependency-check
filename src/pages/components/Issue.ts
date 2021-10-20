import * as commonmark from "commonmark";
import CommonmarkPDFRenderer from "pdfkit-commonmark";
import { Image } from "../../helpers/image";

export const Issue =async ({
  issue,
  doc,
}: {
  issue: any;
  doc: PDFKit.PDFDocument;
}) => {
  const reader = new commonmark.Parser();
  const writer = new CommonmarkPDFRenderer();

  const avatar = await Image.fromUrl(issue.user?.avatar_url)
  // doc.text(issue.id)

  doc.image(avatar, {width: 50});
  doc.moveDown(1)
  doc.fontSize(10).fillColor('grey');
  doc.addNamedDestination(issue.id)  
  doc.text(issue.user?.login)
  doc.text(issue.created_at)
  
  if(issue.title) {
    const title = reader.parse(issue.title);
    writer.render(doc, title, 100);
  }

  doc.moveDown(1)

  if(issue.body) {
    const body = reader.parse(issue.body);
    try {
      writer.render(doc, body);
    } catch (error) {
      doc.text(issue.body)
    }
    
  }
  doc.moveDown(2)
};

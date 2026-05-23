import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer) {
  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  return {
    text: result.text,
    pages: result.total,
  };
}
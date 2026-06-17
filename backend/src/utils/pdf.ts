import { PDFParse } from "pdf-parse";

export type ExtractedPdfImage = {
  pageNumber: number;
  imageIndex: number;
  name: string;
  width: number;
  height: number;
  mimeType: "image/png";
  data: Buffer;
  contextText: string;
};

export type ExtractedPdfContent = {
  text: string;
  pages: number;
  pageTexts: { pageNumber: number; text: string }[];
  images: ExtractedPdfImage[];
  imageExtractionError?: string;
};

const imageThresholdPx = 120;
const maxExtractedImages = 30;
const maxImageContextLength = 1200;

export async function extractTextFromPdf(buffer: Buffer) {
  const result = await extractContentFromPdf(buffer);

  return {
    text: result.text,
    pages: result.pages,
  };
}

export async function extractContentFromPdf(
  buffer: Buffer
): Promise<ExtractedPdfContent> {
  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const textResult = await parser.getText({
      pageJoiner: "\n\n--- Page page_number of total_number ---\n\n",
    });
    const pageTexts = textResult.pages.map((page) => ({
      pageNumber: page.num,
      text: page.text.trim(),
    }));

    let images: ExtractedPdfImage[] = [];
    let imageExtractionError: string | undefined;

    try {
      const imageResult = await parser.getImage({
        imageBuffer: true,
        imageDataUrl: false,
        imageThreshold: imageThresholdPx,
      });
      const seenImages = new Set<string>();

      images = imageResult.pages.flatMap((page) => {
        const contextText =
          pageTexts
            .find((pageText) => pageText.pageNumber === page.pageNumber)
            ?.text.slice(0, maxImageContextLength) || "";

        return page.images
          .map((image, index) => ({
            pageNumber: page.pageNumber,
            imageIndex: index + 1,
            name: image.name || `image-${index + 1}`,
            width: image.width,
            height: image.height,
            mimeType: "image/png" as const,
            data: Buffer.from(image.data),
            contextText,
          }))
          .filter((image) => {
            const key = [
              image.pageNumber,
              image.name,
              image.width,
              image.height,
              image.data.length,
            ].join(":");

            if (seenImages.has(key) || image.data.length === 0) {
              return false;
            }

            seenImages.add(key);
            return true;
          });
      });

      images = images.slice(0, maxExtractedImages);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      imageExtractionError = message;
      console.warn("PDF image extraction failed:", message);
    }

    return {
      text: textResult.text,
      pages: textResult.total,
      pageTexts,
      images,
      imageExtractionError,
    };
  } finally {
    try {
      await parser.destroy();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.warn("PDF parser cleanup failed:", message);
    }
  }
}

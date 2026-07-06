import { PDFParse } from "pdf-parse";
import { createHash } from "crypto";

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
const maxExtractedImages = 18;
const maxImagesPerPage = 4;
const minMeaningfulWidth = 220;
const minMeaningfulHeight = 140;
const minMeaningfulArea = 55_000;
const minMeaningfulBytes = 8_000;
const minAspectRatio = 0.25;
const maxAspectRatio = 5;
const maxImageContextLength = 1200;

type CandidatePdfImage = ExtractedPdfImage & {
  hash: string;
  area: number;
};

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

      const candidates = imageResult.pages.flatMap((page) => {
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
          .map((image): CandidatePdfImage => ({
            ...image,
            hash: hashImage(image.data),
            area: image.width * image.height,
          }))
          .filter(isMeaningfulPdfImage);
      });

      const repeatedImageHashes = findRepeatedImageHashes(
        candidates,
        textResult.total
      );
      const imagesByPage = new Map<number, CandidatePdfImage[]>();

      for (const image of candidates) {
        if (repeatedImageHashes.has(image.hash)) {
          continue;
        }

        const key = [
          image.pageNumber,
          image.hash,
          image.width,
          image.height,
        ].join(":");

        if (seenImages.has(key)) {
          continue;
        }

        seenImages.add(key);
        const pageImages = imagesByPage.get(image.pageNumber) || [];
        pageImages.push(image);
        imagesByPage.set(image.pageNumber, pageImages);
      }

      images = Array.from(imagesByPage.values())
        .flatMap((pageImages) =>
          pageImages
            .sort((a, b) => b.area - a.area)
            .slice(0, maxImagesPerPage)
        )
        .sort((a, b) =>
          a.pageNumber === b.pageNumber
            ? b.area - a.area
            : a.pageNumber - b.pageNumber
        )
        .slice(0, maxExtractedImages)
        .map(({ hash: _hash, area: _area, ...image }) => image);
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

function hashImage(data: Buffer) {
  return createHash("sha1").update(data).digest("hex");
}

function isMeaningfulPdfImage(image: CandidatePdfImage) {
  if (image.data.length < minMeaningfulBytes) {
    return false;
  }

  if (image.width < minMeaningfulWidth || image.height < minMeaningfulHeight) {
    return false;
  }

  if (image.area < minMeaningfulArea) {
    return false;
  }

  const aspectRatio = image.width / image.height;
  if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
    return false;
  }

  return true;
}

function findRepeatedImageHashes(
  images: CandidatePdfImage[],
  totalPages: number
) {
  const pagesByHash = new Map<string, Set<number>>();

  for (const image of images) {
    const pages = pagesByHash.get(image.hash) || new Set<number>();
    pages.add(image.pageNumber);
    pagesByHash.set(image.hash, pages);
  }

  const minRepeatedPages = Math.max(2, Math.ceil(totalPages * 0.3));
  const repeatedHashes = new Set<string>();

  for (const [hash, pages] of pagesByHash) {
    if (pages.size >= minRepeatedPages) {
      repeatedHashes.add(hash);
    }
  }

  return repeatedHashes;
}

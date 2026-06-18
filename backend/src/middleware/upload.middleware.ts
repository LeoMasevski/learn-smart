import multer from "multer";

const pdfMagicBytes = Buffer.from("%PDF-");

export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
    fields: 10,
    parts: 12,
  },
  fileFilter: (_req, file, cb) => {
    const hasPdfMimeType = file.mimetype === "application/pdf";
    const hasPdfExtension = file.originalname.toLowerCase().endsWith(".pdf");

    if (!hasPdfMimeType || !hasPdfExtension) {
      return cb(new Error("Only PDF files are allowed"));
    }

    cb(null, true);
  },
});

export function assertPdfBuffer(buffer: Buffer) {
  if (!buffer.subarray(0, pdfMagicBytes.length).equals(pdfMagicBytes)) {
    throw new Error("Uploaded file is not a valid PDF");
  }
}

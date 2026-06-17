import { supabaseAdmin } from "../../config/supabase";
import { env } from "../../config/env";
import type { ExtractedPdfImage } from "../../utils/pdf";
import type { LessonImageForGeneration } from "../ai/ai.service";

const bucket = env.lessonImagesBucket;

function sanitizePathPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function imageTitle(pageNumber: number, imageIndex: number) {
  return `Slika ${imageIndex} s strani ${pageNumber}`;
}

function getPublicImageUrl(path: string) {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadLessonImages(
  lessonId: string,
  images: ExtractedPdfImage[]
): Promise<LessonImageForGeneration[]> {
  const uploadedImages: LessonImageForGeneration[] = [];

  for (const image of images) {
    const globalIndex = uploadedImages.length + 1;
    const safeName = sanitizePathPart(image.name) || `image-${globalIndex}`;
    const storagePath = [
      "lessons",
      lessonId,
      `page-${image.pageNumber}`,
      `image-${String(image.imageIndex).padStart(2, "0")}-${safeName}.png`,
    ].join("/");

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, image.data, {
        contentType: image.mimeType,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    uploadedImages.push({
      id: `pdf-image-${globalIndex}`,
      url: getPublicImageUrl(storagePath),
      storagePath,
      pageNumber: image.pageNumber,
      imageIndex: image.imageIndex,
      title: imageTitle(image.pageNumber, image.imageIndex),
      alt: `Slika iz PDF gradiva, stran ${image.pageNumber}`,
      width: image.width,
      height: image.height,
      contextText: image.contextText,
    });
  }

  return uploadedImages;
}

export async function listLessonImages(
  lessonId: string
): Promise<LessonImageForGeneration[]> {
  const lessonPrefix = `lessons/${lessonId}`;
  const { data: pageFolders, error: listError } = await supabaseAdmin.storage
    .from(bucket)
    .list(lessonPrefix, {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    });

  if (listError || !pageFolders) {
    return [];
  }

  const images: LessonImageForGeneration[] = [];

  for (const folder of pageFolders) {
    const pageMatch = folder.name.match(/^page-(\d+)$/);
    if (!pageMatch) {
      continue;
    }

    const pageNumber = Number(pageMatch[1]);
    const folderPath = `${lessonPrefix}/${folder.name}`;
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from(bucket)
      .list(folderPath, {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      });

    if (filesError || !files) {
      continue;
    }

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".png")) {
        continue;
      }

      const imageIndex =
        Number(file.name.match(/^image-(\d+)/)?.[1] || images.length + 1);
      const storagePath = `${folderPath}/${file.name}`;

      images.push({
        id: `pdf-image-${images.length + 1}`,
        url: getPublicImageUrl(storagePath),
        storagePath,
        pageNumber,
        imageIndex,
        title: imageTitle(pageNumber, imageIndex),
        alt: `Slika iz PDF gradiva, stran ${pageNumber}`,
        contextText: "",
      });
    }
  }

  return images.sort((a, b) =>
    a.pageNumber === b.pageNumber
      ? a.imageIndex - b.imageIndex
      : a.pageNumber - b.pageNumber
  );
}

export async function deleteLessonImages(lessonId: string) {
  const images = await listLessonImages(lessonId);

  if (images.length === 0) {
    return;
  }

  await supabaseAdmin.storage
    .from(bucket)
    .remove(images.map((image) => image.storagePath));
}

export function getSafeImageUrl(value: string) {
  try {
    const url = new URL(value, window.location.origin);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    if (window.location.protocol === "https:" && url.protocol !== "https:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(value: string) {
  return value.length <= 254 && emailPattern.test(value);
}

export function isStrongEnoughPassword(value: unknown) {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}

export function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function isUuid(value: unknown) {
  return typeof value === "string" && uuidPattern.test(value);
}

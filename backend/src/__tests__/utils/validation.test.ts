import {
  normalizeEmail,
  isValidEmail,
  isStrongEnoughPassword,
  getPasswordPolicyMessage,
  cleanString,
  isUuid,
} from "../../utils/validation";

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });

  it("returns empty string for non-string input", () => {
    expect(normalizeEmail(null)).toBe("");
    expect(normalizeEmail(42)).toBe("");
    expect(normalizeEmail(undefined)).toBe("");
  });
});

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("user+tag@sub.domain.org")).toBe(true);
  });

  it("rejects emails without @", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });

  it("rejects emails without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects emails longer than 254 chars", () => {
    const long = "a".repeat(243) + "@example.com";
    expect(long.length).toBeGreaterThan(254);
    expect(isValidEmail(long)).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isStrongEnoughPassword", () => {
  it("accepts a strong password", () => {
    expect(isStrongEnoughPassword("StrongPass12345!")).toBe(true);
  });

  it("rejects password shorter than 15 chars", () => {
    expect(isStrongEnoughPassword("Short1!")).toBe(false);
  });

  it("rejects password longer than 128 chars", () => {
    expect(isStrongEnoughPassword("A1!" + "a".repeat(127))).toBe(false);
  });

  it("rejects password without uppercase", () => {
    expect(isStrongEnoughPassword("alllowercase123!")).toBe(false);
  });

  it("rejects password without digit", () => {
    expect(isStrongEnoughPassword("NoDigitsHereAtAll!")).toBe(false);
  });

  it("rejects password without symbol", () => {
    expect(isStrongEnoughPassword("NoSymbolsHere123456")).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(isStrongEnoughPassword(null)).toBe(false);
    expect(isStrongEnoughPassword(undefined)).toBe(false);
  });
});

describe("getPasswordPolicyMessage", () => {
  it("returns a non-empty string", () => {
    const msg = getPasswordPolicyMessage();
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });
});

describe("cleanString", () => {
  it("trims whitespace", () => {
    expect(cleanString("  hello  ", 100)).toBe("hello");
  });

  it("truncates to maxLength after trimming", () => {
    expect(cleanString("hello world", 5)).toBe("hello");
  });

  it("returns empty string for non-string input", () => {
    expect(cleanString(42, 100)).toBe("");
    expect(cleanString(null, 100)).toBe("");
    expect(cleanString(undefined, 100)).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(cleanString("", 100)).toBe("");
  });
});

describe("isUuid", () => {
  it("accepts valid v4 UUIDs", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isUuid("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(true);
  });

  it("rejects non-UUID strings", () => {
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("12345678-1234-1234-1234-1234567890zz")).toBe(false);
    expect(isUuid("")).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(isUuid(null)).toBe(false);
    expect(isUuid(42)).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });
});

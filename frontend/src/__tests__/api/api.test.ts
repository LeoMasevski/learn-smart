import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';


vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  const instance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return {
    default: {
      ...actual.default,
      create: vi.fn().mockReturnValue(instance),
      isAxiosError: actual.default.isAxiosError,
    },
  };
});

import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getApiErrorMessage,
} from '../../api/api';

const TOKEN_KEY = 'ls_token';

describe("getStoredToken / setStoredToken / clearStoredToken", () => {
  beforeEach(() => localStorage.clear());

  it("returns null when no token is stored", () => {
    expect(getStoredToken()).toBeNull();
  });

  it("stores and retrieves a token", () => {
    setStoredToken("my-jwt-token");
    expect(getStoredToken()).toBe("my-jwt-token");
  });

  it("clears the stored token", () => {
    setStoredToken("my-jwt-token");
    clearStoredToken();
    expect(getStoredToken()).toBeNull();
  });

  it("stores under the ls_token key", () => {
    setStoredToken("abc");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("abc");
  });
});

describe("getApiErrorMessage", () => {
  it("extracts message from axios error response data", () => {
    const err = {
      isAxiosError: true,
      response: { data: { message: "Unauthorized" } },
    };
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    expect(getApiErrorMessage(err, "Fallback")).toBe("Unauthorized");
  });

  it("extracts msg field when message is absent", () => {
    const err = {
      response: { data: { msg: "Bad request" } },
    };
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    expect(getApiErrorMessage(err, "Fallback")).toBe("Bad request");
  });

  it("returns fallback when error message is empty", () => {
    const err = { response: { data: { message: "  " } } };
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    expect(getApiErrorMessage(err, "Fallback")).toBe("Fallback");
  });

  it("returns fallback for non-axios errors", () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(false);
    expect(getApiErrorMessage(new Error("boom"), "Fallback")).toBe("Fallback");
  });

  it("returns fallback when no response is present", () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    expect(getApiErrorMessage({}, "Fallback")).toBe("Fallback");
  });
});

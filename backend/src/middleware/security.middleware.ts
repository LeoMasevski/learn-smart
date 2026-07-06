import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
  keyGenerator?: (req: Request) => string;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitRecord>();
let cleanupCounter = 0;

export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");

  if (env.nodeEnv === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }

  next();
}

export function rateLimit({
  windowMs,
  max,
  message = "Too many requests, please try again later",
  keyPrefix = "global",
  keyGenerator,
}: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();

    cleanupCounter += 1;
    if (cleanupCounter % 500 === 0) {
      for (const [bucketKey, record] of buckets.entries()) {
        if (record.resetAt <= now) buckets.delete(bucketKey);
      }
    }

    const authenticatedUserId = (req as any).user?.id;
    const identity =
      keyGenerator?.(req) ||
      (typeof authenticatedUserId === "string" && authenticatedUserId
        ? `user:${authenticatedUserId}`
        : `ip:${req.ip || req.socket.remoteAddress || "unknown"}`);
    const key = `${keyPrefix}:${identity}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;

    if (bucket.count > max) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({ message });
    }

    next();
  };
}

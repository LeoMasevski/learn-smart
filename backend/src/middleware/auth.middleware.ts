import { Request, Response, NextFunction } from "express";
import { supabase, supabaseAdmin } from "../config/supabase";

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );

    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

async function userHasVerifiedMfaFactor(userId: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.mfa.listFactors({
      userId,
    });

    if (error || !data) return false;

    const factors = (data as any).all ?? (data as any).factors ?? [];

    return factors.some(
      (factor: any) =>
        (factor.factor_type === "totp" || factor.type === "totp") &&
        factor.status === "verified"
    );
  } catch {
    return false;
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Missing or invalid authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  const claims = decodeJwtPayload(token);
  const hasVerifiedMfa = await userHasVerifiedMfaFactor(data.user.id);
  if (hasVerifiedMfa && claims?.aal !== "aal2") {
    return res.status(401).json({
      message: "MFA verification required",
      code: "mfa_required",
    });
  }

  (req as any).user = data.user;

  next();
}

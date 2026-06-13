import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase";

export type UserRole = "STUDENT" | "PROFESSOR";

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !profile) return null;

  return profile.role === "STUDENT" || profile.role === "PROFESSOR"
    ? profile.role
    : null;
}

export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const role = await getUserRole(user.id);

    if (!role) {
      return res.status(403).json({
        message: "Profile not found",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    (req as any).userRole = role;

    next();
  };
}

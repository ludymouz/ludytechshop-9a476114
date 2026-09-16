import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { unlocked?: boolean };

function config() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "ludy-admin",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

export function matches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export async function getAdminSession() {
  return useSession<AdminSession>(config());
}

export async function isAdminUnlocked(): Promise<boolean> {
  const s = await getAdminSession();
  return s.data.unlocked === true;
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminUnlocked())) throw new Error("NAO_AUTORIZADO");
}

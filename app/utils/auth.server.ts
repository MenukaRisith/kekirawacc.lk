// app/utils/auth.server.ts
import { createCookie, redirect } from "@remix-run/node";
import { pool } from "~/utils/db.server";

export type UserRole = "ADMIN" | "AUTHOR" | "CLUB_REP";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  clubId: number | null;
};

const sessionCookie = createCookie("kcc_session", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
  secrets: [process.env.SESSION_SECRET || "dev-secret"],
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

// ===== Helpers for DB session =====

async function createDbSession(userId: number): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await pool.query(
    `
      INSERT INTO Session (id, userId, expiresAt)
      VALUES (?, ?, ?)
    `,
    [sessionId, userId, expiresAt]
  );

  return sessionId;
}

async function deleteDbSession(sessionId: string) {
  await pool.query(`DELETE FROM Session WHERE id = ?`, [sessionId]);
}

async function getUserBySessionId(sessionId: string): Promise<AuthUser | null> {
  const [rows] = await pool.query(
    `
      SELECT 
        u.id,
        u.fullName,
        u.email,
        u.role,
        u.clubId
      FROM Session s
      JOIN User u ON u.id = s.userId
      WHERE s.id = ?
        AND s.expiresAt > NOW()
      LIMIT 1
    `,
    [sessionId]
  );

  const result = rows as {
    id: number;
    fullName: string;
    email: string;
    role: UserRole;
    clubId: number | null;
  }[];

  if (!result || result.length === 0) return null;
  return result[0];
}

// ===== Public API =====

export async function getSessionIdFromRequest(
  request: Request
): Promise<string | null> {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  const sessionId = await sessionCookie.parse(cookieHeader);
  if (!sessionId || typeof sessionId !== "string") return null;
  return sessionId;
}

export async function getCurrentUser(
  request: Request
): Promise<AuthUser | null> {
  const sessionId = await getSessionIdFromRequest(request);
  if (!sessionId) return null;
  return await getUserBySessionId(sessionId);
}

export async function requireUser(request: Request): Promise<AuthUser> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw redirect("/login?redirectTo=" + encodeURIComponent(new URL(request.url).pathname));
  }
  return user;
}

export async function requireUserWithRole(
  request: Request,
  allowedRoles: UserRole[]
): Promise<AuthUser> {
  const user = await requireUser(request);
  if (!allowedRoles.includes(user.role)) {
    throw redirect("/"); // or /unauthorized
  }
  return user;
}

export async function login({
  userId,
  redirectTo = "/admin",
}: {
  request: Request;
  userId: number;
  redirectTo?: string;
}) {
  const sessionId = await createDbSession(userId);
  const cookie = await sessionCookie.serialize(sessionId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": cookie,
    },
  });
}

export async function logout(request: Request) {
  const sessionId = await getSessionIdFromRequest(request);
  if (sessionId) {
    await deleteDbSession(sessionId);
  }
  const cookie = await sessionCookie.serialize("", { maxAge: 0 });
  return redirect("/", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
}

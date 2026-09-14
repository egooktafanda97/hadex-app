import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Role } from "@/lib/permissions";

export async function requireUser(allowed?: Role[]) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = db.prepare("SELECT id,name,email,phone,role,is_active FROM users WHERE id=?").get(session.user.id) as { id:string; name:string; email:string; phone:string|null; role:Role; is_active:number } | undefined;
  if (!user?.is_active) redirect("/login");
  if (allowed && !allowed.includes(user.role)) redirect(`/${user.role}/dashboard`);
  return user;
}

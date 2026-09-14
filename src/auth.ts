import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/schemas/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/login" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const user = db.prepare("SELECT id,name,email,password_hash,role,is_active FROM users WHERE email=?").get(parsed.data.email) as { id:string; name:string; email:string; password_hash:string; role:string; is_active:number } | undefined;
      if (!user?.is_active || !(await bcrypt.compare(parsed.data.password, user.password_hash))) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) token.role = user.role; return token; },
    session({ session, token }) { if (session.user) { session.user.id = token.sub!; session.user.role = token.role as string; } return session; },
    authorized({ auth }) { return Boolean(auth?.user); },
  },
});

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true, // self-hosted: the reverse proxy controls the Host header
    session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
    pages: { signIn: "/login" },
    providers: [
        Credentials({
            name: "Admin",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = (credentials?.email || "").toString().trim().toLowerCase();
                const password = (credentials?.password || "").toString();

                const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
                const adminHash = process.env.ADMIN_PASSWORD_HASH || "";

                if (!adminEmail || !adminHash || !email || !password) return null;

                const emailMatches = email === adminEmail;
                // Always run the hash comparison to keep timing consistent
                const passwordMatches = await bcrypt.compare(password, adminHash);

                if (emailMatches && passwordMatches) {
                    return { id: "admin", email: adminEmail, name: "Admin", role: "admin" };
                }
                return null;
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) token.role = user.role;
            return token;
        },
        session({ session, token }) {
            if (session.user) session.user.role = token.role as string | undefined;
            return session;
        },
    },
});

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

// Compared against when the email is unknown, to keep timing consistent
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

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
                if (!email || !password) return null;

                await connectDB();
                const user = await User.findOne({ email }).lean();

                const passwordMatches = await bcrypt.compare(
                    password,
                    user?.passwordHash || DUMMY_HASH
                );
                if (!user || !passwordMatches) return null;

                return {
                    id: String(user._id),
                    email: user.email,
                    name: user.name || "Admin",
                    role: user.role,
                };
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

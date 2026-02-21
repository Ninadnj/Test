import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

// Custom TikTok OAuth2 provider (not built into next-auth)
const TikTokProvider = {
    id: "tiktok",
    name: "TikTok",
    type: "oauth" as const,
    authorization: {
        url: "https://www.tiktok.com/v2/auth/authorize",
        params: {
            client_key: process.env.TIKTOK_CLIENT_ID,
            response_type: "code",
            scope: "user.info.basic",
        },
    },
    token: "https://open.tiktokapis.com/v2/oauth/token/",
    userinfo: "https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name",
    clientId: process.env.TIKTOK_CLIENT_ID,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    profile(profile: { data: { user: { open_id: string; display_name: string; avatar_url: string } } }) {
        const user = profile.data.user;
        return {
            id: user.open_id,
            name: user.display_name,
            image: user.avatar_url,
            email: `tiktok_${user.open_id}@tiktok.placeholder`,
        };
    },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "database" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        TikTokProvider,
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.passwordHash) return null;

                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );
                if (!passwordMatch) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id;
                // Fetch role from DB since it's not in the default User type
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { role: true }
                });
                session.user.role = dbUser?.role ?? "USER";
            }
            return session;
        }
    },
    events: {
        // When a new OAuth user signs in for the first time, sync avatar
        async signIn({ user, account, profile }) {
            if (account?.provider !== "credentials" && user.id) {
                const avatarUrl = (profile as { picture?: string; avatar_url?: string })?.picture
                    ?? (profile as { picture?: string; avatar_url?: string })?.avatar_url
                    ?? null;

                if (avatarUrl) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { avatar: avatarUrl }
                    }).catch(() => { }); // non-blocking
                }
            }
        }
    },
    pages: {
        signIn: '/auth',
    },
})

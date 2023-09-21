import { NextAuthOptions } from "next-auth";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { fetchRedis } from "@/helpers/redis";

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientToken = process.env.GOOGLE_CLIENT_TOKEN;
  if (!clientId || clientId.length == 0) {
    throw Error("Missing GOOGLE_CLIENT_ID !");
  }

  if (!clientToken || clientToken.length == 0) {
    throw Error("Missing GOOGLE_CLIENT_TOKEN !");
  }

  return { clientId, clientToken };
}
export const authOptions: NextAuthOptions = {
  //when user signs up with auth there data (email etc) is going to put into db directly by adapters
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },

  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientToken,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const dbUserResult: string | null = await fetchRedis(
        "get",
        `user:${token.id}`
      );
      if (!dbUserResult) {
        token.id = user!.id;
        return token;
      }

      const dbUser = JSON.parse(dbUserResult) as User;

      const { name, id, email, image } = dbUser;

      return {
        name,
        id,
        email,
        picture: image,
      };
    },
    async session({ session, token }) {
      const { name, id, email, picture } = token;
      if (token) {
        session.user.id = id;
        session.user.email = email;
        session.user.name = name;
        session.user.image = picture;
      }

      return session;
    },
    redirect() {
      return `/dashboard`;
    },
  },
};

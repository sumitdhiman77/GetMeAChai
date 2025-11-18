import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import User from "@/app/models/User";
import connectDB from "@/db/connectDb";

export const authoptions = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, profile }) {
      await connectDB();
      let currentUser = await User.findOne({ email: user.email });

      if (!currentUser) {
        currentUser = await User.create({
          email: user.email,
          username: user.email.split("@")[0],
          name: profile?.name || user.email.split("@")[0],
        });
      }

      user.id = currentUser._id.toString();
      user.username = currentUser.username;

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.username;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET, // FIXED
});

export { authoptions as GET, authoptions as POST };

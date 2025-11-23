// src/app/api/auth/imagekit-auth/route.ts
import { getUploadAuthParams } from "@imagekit/next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const authenticationParameters = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
    });

    return NextResponse.json({
      authenticationParameters,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json({ error: "Imagekit auth failed" }, { status: 500 });
  }
}

// import NextAuth from "next-auth";
// import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import User from "@/app/models/User";
// import connectDB from "@/db/connectDb";

// export const authoptions = NextAuth({
//   providers: [
//     GitHubProvider({
//       clientId: process.env.GITHUB_ID,
//       clientSecret: process.env.GITHUB_SECRET,
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],

//   callbacks: {
//     async signIn({ user, profile }) {
//       await connectDB();
//       let currentUser = await User.findOne({ email: user.email });

//       if (!currentUser) {
//         currentUser = await User.create({
//           email: user.email,
//           username: user.email.split("@")[0],
//           name: profile?.name || user.email.split("@")[0],
//         });
//       }

//       user.id = currentUser._id.toString();
//       user.username = currentUser.username;

//       return true;
//     },

//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.username = user.username;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       session.user.id = token.id;
//       session.user.name = token.username;
//       return session;
//     },
//   },

//   secret: process.env.NEXTAUTH_SECRET, // FIXED
// });

// export { authoptions as GET, authoptions as POST };

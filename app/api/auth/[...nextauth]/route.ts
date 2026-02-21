import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "test@clinician.com" &&
          credentials.password === "password"
        ) {
          return { id: "1", name: "Test Clinician", email: "test@clinician.com" }
        }
        return null
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

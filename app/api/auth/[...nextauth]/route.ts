import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = {
          id: "1",
          name: "Clinician One",
          email: "clinician@example.com",
          password: "$2a$12$yYl8a/1examplehashedpassword" // replace with bcrypt.hashSync("yourpassword", 12)
        }

        if (
          credentials?.email === user.email &&
          credentials?.password &&
          bcrypt.compareSync(credentials.password, user.password)
        ) {
          return { id: user.id, name: user.name, email: user.email }
        }
        return null
      },
    }),
  ],
  pages: { signIn: "/auth/signin" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      emailVerified?: Date | null
      subscriptionPlan?: string
      role?: string
    }
  }

  interface User {
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}
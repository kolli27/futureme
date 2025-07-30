import { NextAuthOptions } from "next-auth"
import PostgresAdapter from "@auth/pg-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { getPool } from "@/lib/db/config"
import { userModel } from "@/lib/db/models/user"
import { verifyPassword, recordLoginAttempt, isLoginRateLimited } from "@/lib/auth/password"
import { emailService } from "@/lib/auth/email"
import { tokenService } from "@/lib/auth/tokens"

// Custom adapter for our PostgreSQL setup
const customAdapter = {
  ...PostgresAdapter(getPool()),
  // Override methods to work with our user model
  async createUser(user: any) {
    const newUser = await userModel.create({
      email: user.email,
      name: user.name || user.email.split('@')[0],
      avatar_url: user.image,
      email_verified_at: user.emailVerified ? new Date() : null
    })
    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      image: newUser.avatar_url,
      emailVerified: newUser.email_verified_at
    }
  },
  async getUser(id: string) {
    const user = await userModel.findById(id)
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.avatar_url,
      emailVerified: user.email_verified_at
    }
  },
  async getUserByEmail(email: string) {
    const user = await userModel.findByEmail(email)
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.avatar_url,
      emailVerified: user.email_verified_at
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  providers: [
    // OAuth Providers - Production Ready
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        },
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            emailVerified: profile.email_verified ? new Date() : null
          }
        }
      })
    ] : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
        authorization: {
          params: {
            scope: "read:user user:email"
          }
        }
      })
    ] : []),
    // Add Apple provider if configured
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET ? [
      {
        id: "apple",
        name: "Apple",
        type: "oauth" as const,
        authorization: "https://appleid.apple.com/auth/authorize",
        token: "https://appleid.apple.com/auth/token",
        userinfo: "https://appleid.apple.com/auth/userinfo",
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_SECRET,
        client: {
          token_endpoint_auth_method: "client_secret_post"
        },
        profile(profile: any) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: null,
            emailVerified: profile.email_verified ? new Date() : null
          }
        }
      }
    ] : []),
    // Credentials Provider - Production Ready
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        const email = credentials.email.toLowerCase().trim()
        const ip = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'

        // Check rate limiting
        const rateLimitStatus = isLoginRateLimited(email, ip as string)
        if (rateLimitStatus.isLimited) {
          console.log(`🚫 Rate limited: ${email} from ${ip}`)
          recordLoginAttempt(email, ip as string, false)
          throw new Error(`Too many failed attempts. Try again in ${Math.ceil((rateLimitStatus.resetTime!.getTime() - Date.now()) / 60000)} minutes.`)
        }

        try {
          // Find user in database
          const user = await userModel.findByEmail(email)
          if (!user) {
            console.log(`❌ User not found: ${email}`)
            recordLoginAttempt(email, ip as string, false)
            return null
          }

          // Check if account is active
          if (!user.is_active) {
            console.log(`❌ Account inactive: ${email}`)
            recordLoginAttempt(email, ip as string, false)
            throw new Error("Account is not active. Please contact support.")
          }

          // Verify password
          if (!user.password_hash) {
            console.log(`❌ No password set: ${email}`)
            recordLoginAttempt(email, ip as string, false)
            throw new Error("Password login not available for this account. Please use social login.")
          }

          const isValidPassword = await verifyPassword(credentials.password, user.password_hash)
          if (!isValidPassword) {
            console.log(`❌ Invalid password: ${email}`)
            recordLoginAttempt(email, ip as string, false)
            return null
          }

          // Check email verification for new accounts
          if (!user.email_verified_at && process.env.NODE_ENV === 'production') {
            console.log(`❌ Email not verified: ${email}`)
            recordLoginAttempt(email, ip as string, false)
            throw new Error("Please verify your email address before signing in.")
          }

          // Successful login
          console.log(`✅ User authenticated: ${email}`)
          recordLoginAttempt(email, ip as string, true)
          
          // Update last login
          await userModel.updateLastLogin(user.id)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar_url,
            emailVerified: user.email_verified_at
          }
        } catch (error) {
          console.error(`❌ Authentication error for ${email}:`, error)
          recordLoginAttempt(email, ip as string, false)
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/welcome' // Redirect new users to onboarding
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Handle OAuth sign-ins
        if (account?.provider !== 'credentials') {
          // Check if user exists
          const existingUser = await userModel.findByEmail(user.email!)
          
          if (!existingUser) {
            // Create new user for OAuth
            const newUser = await userModel.create({
              email: user.email!,
              name: user.name || user.email!.split('@')[0],
              avatar_url: user.image,
              email_verified_at: new Date(), // OAuth emails are pre-verified
              is_active: true
            })
            
            // Send welcome email
            await emailService.sendWelcome(newUser.email, newUser.name)
            
            user.id = newUser.id
          } else {
            // Update existing user's OAuth info
            if (user.image && user.image !== existingUser.avatar_url) {
              await userModel.update(existingUser.id, { avatar_url: user.image })
            }
            await userModel.updateLastLogin(existingUser.id)
            user.id = existingUser.id
          }
        }

        return true
      } catch (error) {
        console.error('Sign in callback error:', error)
        return false
      }
    },
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.emailVerified = user.emailVerified
      }

      // Handle token refresh
      if (trigger === "update" && session) {
        // Update token with fresh user data
        const freshUser = await userModel.findById(token.id as string)
        if (freshUser) {
          token.name = freshUser.name
          token.email = freshUser.email
          token.picture = freshUser.avatar_url
          token.emailVerified = freshUser.email_verified_at
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.emailVerified = token.emailVerified as Date
        
        // Add additional user data
        try {
          const userData = await userModel.findWithProgressAndSubscription(token.id as string)
          if (userData) {
            // Add subscription and progress info to session
            (session as any).subscription = userData.subscription
            (session as any).progress = userData.progress
            (session as any).onboardingCompleted = userData.user.onboarding_completed
          }
        } catch (error) {
          console.error('Session callback error:', error)
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      try {
        // Allow relative callbacks
        if (url.startsWith("/")) return `${baseUrl}${url}`
        
        // Allow same-origin callbacks
        if (new URL(url).origin === baseUrl) return url
        
        // Default redirect
        return `${baseUrl}/dashboard`
      } catch (error) {
        console.error("Redirect error:", error)
        return `${baseUrl}/dashboard`
      }
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`🔑 User signed in: ${user.email} via ${account?.provider}`)
      
      // Analytics event
      // await analytics.track('user_signed_in', {
      //   userId: user.id,
      //   provider: account?.provider,
      //   isNewUser
      // })
    },
    async signOut({ session, token }) {
      console.log(`🚪 User signed out: ${session?.user?.email}`)
      
      // Clean up any session-specific data
      // await analytics.track('user_signed_out', {
      //   userId: session?.user?.id
      // })
    },
    async createUser({ user }) {
      console.log(`👤 New user created: ${user.email}`)
      
      // Analytics event
      // await analytics.track('user_created', {
      //   userId: user.id,
      //   email: user.email
      // })
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error(`NextAuth Error [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`NextAuth Warning [${code}]`)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`NextAuth Debug [${code}]:`, metadata)
      }
    }
  }
}
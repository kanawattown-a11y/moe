import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            role: string
            id: string
            permissions?: string[]
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        permissions?: any
    }
}

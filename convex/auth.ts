import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'
import { DataModel } from './_generated/dataModel'

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: params.email as string,
          name: (params.name as string) ?? undefined,
        }
      },
      reset: {
        id: 'password-reset',
        type: 'email' as const,
        name: 'Password Reset',
        from: 'Cedric Masters Autos <noreply@cedricmastersautos.com>',
        maxAge: 60 * 60,
        sendVerificationRequest: async ({ identifier, url, token }) => {
          console.log(
            `[PASSWORD RESET] Code for ${identifier}: ${token}`,
          )
          console.log(
            `[PASSWORD RESET] URL for ${identifier}: ${url}`,
          )
        },
      },
    }),
  ],
})

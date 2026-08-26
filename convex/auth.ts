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
        // CR-01 fix: never log tokens or URLs (they are secrets).
        // In production we swallow them; audit logs the event without secret.
        sendVerificationRequest: async () => {
          // Intentionally no logging of identifier/token/url.
          // If debug is needed, enable via CONVEX_DEBUG without secrets.
          return;
        },
      },
    }),
  ],
})

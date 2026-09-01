import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'
import { DataModel } from './_generated/dataModel'
import { normalizeEmailForAuth } from './lib/auth'

export function getPasswordResetEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim()
  if (!apiKey || !from) {
    throw new Error(
      'Password reset email delivery is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in your environment.',
    )
  }
  return { apiKey, from }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        const email = normalizeEmailForAuth(params.email as string | undefined)
        if (!email) {
          throw new Error('Email is required.')
        }
        return {
          email,
          name: (params.name as string | undefined)?.trim() || undefined,
          totpEnabled: true,
        }
      },
      reset: {
        id: 'password-reset',
        type: 'email' as const,
        name: 'Password Reset',
        from: process.env.RESEND_FROM_EMAIL?.trim() || 'Cedric Masters Autos <noreply@cedricmastersautos.com>',
        maxAge: 60 * 60,
        sendVerificationRequest: async ({ identifier, url }) => {
          const { apiKey, from } = getPasswordResetEmailConfig()
          const subject = 'Reset your password'
          const text = [
            'Use the link below to reset your password.',
            '',
            url,
            '',
            'If you did not request this, you can ignore this email.',
          ].join('\n')
          const html = `
            <p>Use the link below to reset your password.</p>
            <p><a href="${url}">Reset password</a></p>
            <p>If you did not request this, you can ignore this email.</p>
          `

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from,
              to: [identifier],
              subject,
              html,
              text,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text().catch(() => '')
            throw new Error(
              `Failed to send password reset email: ${errorText || response.statusText || 'unknown error'}`,
            )
          }
        },
      },
    }),
  ],
})

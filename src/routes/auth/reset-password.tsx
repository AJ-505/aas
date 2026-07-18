import { useState } from 'react'
import { useRouter, createFileRoute, Link } from '@tanstack/react-router'
import { useAuthActions } from '@convex-dev/auth/react'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent } from '~/components/ui/card'

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { signIn } = useAuthActions()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setSubmitting(true)
    try {
      await signIn('password', formData)
      toast.success('Password reset successfully')
      setCompleted(true)
      setTimeout(() => void router.navigate({ to: '/auth/login' }), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Reset failed'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full shadow-[0_18px_50px_rgba(15,18,34,0.10)]">
      <CardContent className="pt-6">
        <div className="mb-5">
          <h1 className="text-lg font-extrabold tracking-tight text-ink">Set new password</h1>
          <p className="mt-1 text-[13px] text-mute">
            {completed
              ? 'Your password has been reset. Redirecting to sign in...'
              : 'Enter the code from your email and choose a new password.'}
          </p>
        </div>
        {completed ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-accent-soft px-4 py-3 text-[13px] text-accent">
              Your password was reset successfully. You will be redirected to sign in.
            </div>
            <Link to="/auth/login">
              <Button type="button" variant="ghost" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Reset code</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="Enter the code from the email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="At least 8 characters"
                required
              />
            </div>
            <input name="flow" type="hidden" value="reset-verification" />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Resetting...' : 'Reset password'}
            </Button>
            <Link to="/auth/login">
              <Button type="button" variant="ghost" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

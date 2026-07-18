import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuthActions } from '@convex-dev/auth/react'
import toast from 'react-hot-toast'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent } from '~/components/ui/card'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

type AuthStep = 'signIn' | 'signUp' | 'forgotPassword'

function LoginPage() {
  const { signIn } = useAuthActions()
  const router = useRouter()
  const [step, setStep] = useState<AuthStep>('signIn')
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setSubmitting(true)
    try {
      if (step === 'forgotPassword') {
        await signIn('password', formData)
        setResetSent(true)
        toast.success('Check your email for reset link')
        return
      }
      await signIn('password', formData)
      toast.success(step === 'signIn' ? 'Signed in' : 'Account created')
      void router.navigate({ to: '/' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'forgotPassword') {
    return (
      <Card className="w-full shadow-[0_18px_50px_rgba(15,18,34,0.10)]">
        <CardContent className="pt-6">
          <div className="mb-5">
            <h1 className="text-lg font-extrabold tracking-tight text-ink">Reset your password</h1>
            <p className="mt-1 text-[13px] text-mute">
              {resetSent
                ? 'If an account exists with that email, you will receive a reset link.'
                : 'Enter your email and we will send you a reset link.'}
            </p>
          </div>
          {resetSent ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent-soft px-4 py-3 text-[13px] text-accent">
                Check your email for the reset link. If it does not appear within a few minutes,
                check your spam folder.
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('signIn')
                  setResetSent(false)
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <input name="flow" type="hidden" value="reset" />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send reset link'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('signIn')
                  setResetSent(false)
                }}
              >
                Back to sign in
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-[0_18px_50px_rgba(15,18,34,0.10)]">
      <CardContent className="pt-6">
        <div className="mb-5">
          <h1 className="text-lg font-extrabold tracking-tight text-ink">
            {step === 'signIn' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-[13px] text-mute">
            {step === 'signIn' ? 'Sign in to the workshop dashboard.' : 'Sign up to get started.'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'signUp' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" placeholder="Your name" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {step === 'signIn' && (
                <button
                  type="button"
                  onClick={() => setStep('forgotPassword')}
                  className="text-[13px] text-accent hover:text-accent-deep"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <Input id="password" name="password" type="password" placeholder="********" required />
          </div>
          <input name="flow" type="hidden" value={step} />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Please wait...' : step === 'signIn' ? 'Sign in' : 'Sign up'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setStep(step === 'signIn' ? 'signUp' : 'signIn')}
          >
            {step === 'signIn' ? 'Create an account instead' : 'Sign in instead'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

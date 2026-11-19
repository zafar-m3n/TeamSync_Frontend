import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { useAuth } from '@/store/useAuth'
import AuthLayout from '@/components/layout/AuthLayout'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// 429 = too many attempts (lockout); anything else is a sign-in failure.
function FormBanner({ error }) {
  const locked = error.status === 429
  return (
    <div
      role="alert"
      className={clsx(
        'flex gap-2.5 rounded-lg border px-3 py-2.5 text-sm',
        locked ? 'border-warning/25 bg-warning-soft text-warning' : 'border-danger/20 bg-danger-soft text-danger',
      )}
    >
      <Icon icon={locked ? 'lucide:lock' : 'lucide:circle-alert'} width="18" height="18" aria-hidden className="mt-px shrink-0" />
      <div>
        {locked && <p className="font-semibold">Too many attempts</p>}
        <p>{error.message}</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async ({ email, password }) => {
    setFormError(null)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError({ message: err.message || 'Something went wrong. Please try again.', status: err.status })
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-display text-3xl font-semibold text-fg">Sign in</h1>
          <p className="mt-1.5 text-sm text-fg-muted">Use your work email and password to continue.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {formError && <FormBanner error={formError} />}

          <FormField label="Work email" required error={errors.email?.message}>
            <Input type="email" autoComplete="email" placeholder="name@company.com" className="h-11" {...register('email')} />
          </FormField>

          <FormField label="Password" required error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-11"
              {...register('password')}
            />
          </FormField>

          <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
            Sign in
          </Button>
        </form>

        <p className="text-cell text-fg-muted">
          Forgot your password? Ask HR or your system administrator to reset it.
        </p>
      </div>
    </AuthLayout>
  )
}

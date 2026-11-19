import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useChangePassword } from '@/hooks/useChangePassword'
import { toast } from '@/hooks/useToast'
import { useAuth } from '@/store/useAuth'

const FIELDS = ['currentPassword', 'newPassword', 'confirmPassword']

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm the new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' }

export default function ChangePasswordForm() {
  const mutation = useChangePassword()
  const { replaceToken } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY })

  const onSubmit = ({ currentPassword, newPassword }) => {
    mutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: (body) => {
          replaceToken(body.data.token)
          reset(EMPTY)
          toast.success('Password changed. Other sessions have been signed out.')
        },
        onError: (error) => {
          const fieldErrors = (error.details ?? [])
            .map((d) => ({ ...d, field: d.field.replace(/^body\./, '') }))
            .filter((d) => FIELDS.includes(d.field))
          if (fieldErrors.length === 0) {
            toast.error(error.message)
            return
          }
          fieldErrors.forEach((d, i) =>
            setError(d.field, { message: d.message }, { shouldFocus: i === 0 }),
          )
        },
      },
    )
  }

  return (
    <Card
      id="change-password"
      className="scroll-mt-20"
      title="Change password"
      description="Changing it signs you out of your other sessions."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid max-w-md gap-4"
        noValidate
      >
        <FormField label="Current Password" required error={errors.currentPassword?.message}>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Enter your current password"
            {...register('currentPassword')}
          />
        </FormField>
        <FormField label="New Password" required error={errors.newPassword?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...register('newPassword')}
          />
        </FormField>
        <FormField label="Confirm New Password" required error={errors.confirmPassword?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter the new password"
            {...register('confirmPassword')}
          />
        </FormField>
        <div>
          <Button type="submit" variant="primary" isLoading={mutation.isPending}>
            Change password
          </Button>
        </div>
      </form>
    </Card>
  )
}

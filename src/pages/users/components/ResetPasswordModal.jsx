import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import { useResetPassword } from '@/hooks/useResetPassword'

const schema = z
  .object({
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm the password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPasswordModal({ user, onClose }) {
  const mutation = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = (values) => {
    // confirmPassword is client-only — never sent to the API.
    mutation.mutate(
      { id: user.id, newPassword: values.newPassword },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Reset password"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="reset-password-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            Reset password
          </Button>
        </>
      }
    >
      <form
        id="reset-password-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <p className="text-sm text-gray-500">
          Set a new password for <span className="font-medium text-text">{user.email}</span>.
          You&rsquo;ll need to share it with them yourself.
        </p>
        <FormField label="New Password" required error={errors.newPassword?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            autoFocus
            placeholder="••••••••"
            {...register('newPassword')}
          />
        </FormField>
        <FormField
          label="Confirm Password"
          required
          error={errors.confirmPassword?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
        </FormField>
      </form>
    </Modal>
  )
}

import { useMutation } from '@tanstack/react-query'
import { changePassword } from '@/services/authService'

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) => changePassword(currentPassword, newPassword),
  })
}

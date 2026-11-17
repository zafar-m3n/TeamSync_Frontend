import { useToastStore } from '@/store/ui/toastStore'

const push = (tone) => (message) => useToastStore.getState().push(tone, message)

// Callable from anywhere, inside or outside React.
export const toast = {
  success: push('success'),
  error: push('danger'),
  info: push('info'),
  warning: push('warning'),
}

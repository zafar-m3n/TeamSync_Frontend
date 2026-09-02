import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 90 * 1000,
      retry: 1,
      // refetchOnWindowFocus left at its default (true) on purpose.
    },
  },
})

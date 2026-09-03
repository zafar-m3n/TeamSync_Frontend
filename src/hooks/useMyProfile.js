import { useQuery } from '@tanstack/react-query'
import { getMyProfile } from '@/services/employeeService'

export function useMyProfile() {
  return useQuery({
    queryKey: ['employees', 'me'],
    queryFn: async () => {
      try {
        const res = await getMyProfile()
        return res.data
      } catch (err) {
        // A bare account with no linked Employee row is an expected, valid case
        // for the topbar — surface it as "no profile" (null), not a query error.
        if (err?.status === 404 || err?.code === 'NO_EMPLOYEE_PROFILE') {
          return null
        }
        throw err
      }
    },
  })
}

import { useAuth } from '../../store/AuthContext'
import { useDashboard } from '../../hooks/useDashboard'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import EmployeeDashboardView from './components/EmployeeDashboardView'
import ManagerDashboardView from './components/ManagerDashboardView'
import AdminDashboardView from './components/AdminDashboardView'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" className="text-accent" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-gray-600">
          {error?.message || 'Something went wrong loading your dashboard.'}
        </p>
        <Button onClick={() => refetch()} isLoading={isFetching}>
          Try again
        </Button>
      </div>
    )
  }

  const role = user.roleName
  if (role === 'Manager') return <ManagerDashboardView data={data} />
  if (role === 'HR' || role === 'Admin') return <AdminDashboardView data={data} />
  return <EmployeeDashboardView data={data} />
}

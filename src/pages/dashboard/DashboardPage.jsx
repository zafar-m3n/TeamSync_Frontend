import { useAuth } from '../../store/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="p-4">
      Logged in as {user.email} ({user.roleName})
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import { buttonBase, buttonVariants } from '@/components/ui/buttonStyles'

// Shown in place of a page the signed-in user has no permission for (direct URL access).
export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <ErrorState
          kind="forbidden"
          title="You don’t have access to this page"
          message="Your role doesn’t include the permission this page needs. Ask an administrator if you think you should be able to see it."
          action={
            <Link to="/dashboard" className={clsx(buttonBase, buttonVariants.secondary, 'h-9 gap-2 rounded-md px-4 text-sm')}>
              <Icon icon="lucide:layout-dashboard" width="16" height="16" aria-hidden />
              Go to dashboard
            </Link>
          }
        />
      </Card>
    </div>
  )
}

import Card from '@/components/ui/Card'
import Skeleton, { LoadingRegion } from '@/components/ui/Skeleton'

// Shape of EmployeeDetailView while the record loads.
export default function EmployeeDetailSkeleton({ label = 'Loading employee' }) {
  return (
    <LoadingRegion label={label} className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <Card className="w-full shrink-0 lg:w-72">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="mt-4 h-6 w-40" />
        <Skeleton className="mt-3 h-5 w-28" />
        <Skeleton className="mt-5 h-9 w-full" />
        <div className="mt-6 space-y-4 border-t border-line pt-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          ))}
        </div>
      </Card>
      <div className="min-w-0 flex-1 space-y-5">
        <Skeleton className="h-10 w-full max-w-md" />
        <Card>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-3.5 w-36" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </LoadingRegion>
  )
}

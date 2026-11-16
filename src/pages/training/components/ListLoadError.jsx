import Button from '@/components/ui/Button'

export default function ListLoadError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
      <p className="text-sm text-gray-600">
        {message}
      </p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

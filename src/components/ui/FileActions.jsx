import { useState } from 'react'
import IconButton from '@/components/ui/IconButton'
import { toast } from '@/hooks/useToast'
import { canPreview, downloadFile, openFile } from '@/lib/files'

// View (PDF and images, in a new tab) and Download buttons for a stored file.
export default function FileActions({ url, mimeType, name }) {
  const [pending, setPending] = useState(null)

  const run = async (kind, action) => {
    setPending(kind)
    try {
      await action(url)
    } catch (error) {
      toast.error(error?.message || 'Could not open the file.')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {canPreview(mimeType) && (
        <IconButton
          icon="lucide:eye"
          label={`View ${name}`}
          variant="ghost"
          size="sm"
          isLoading={pending === 'view'}
          disabled={pending != null}
          onClick={() => run('view', openFile)}
        />
      )}
      <IconButton
        icon="lucide:download"
        label={`Download ${name}`}
        variant="ghost"
        size="sm"
        isLoading={pending === 'download'}
        disabled={pending != null}
        onClick={() => run('download', downloadFile)}
      />
    </div>
  )
}

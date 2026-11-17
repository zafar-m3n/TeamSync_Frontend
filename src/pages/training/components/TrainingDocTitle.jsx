import { Icon } from '@iconify/react'
import clsx from 'clsx'

const KIND = {
  'application/pdf': { icon: 'lucide:file-text', tone: 'bg-danger-soft text-danger' },
  'image/jpeg': { icon: 'lucide:file-image', tone: 'bg-info-soft text-info' },
  'image/png': { icon: 'lucide:file-image', tone: 'bg-info-soft text-info' },
}
const WORD = { icon: 'lucide:file-type', tone: 'bg-brand-50 text-brand-700' }

// Document title with a small file-type tile (PDF, image, Word).
export default function TrainingDocTitle({ title, mimeType }) {
  const kind = KIND[mimeType] ?? WORD
  return (
    <span className="flex items-center gap-2.5">
      <span className={clsx('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', kind.tone)}>
        <Icon icon={kind.icon} width="16" height="16" aria-hidden />
      </span>
      <span className="font-medium text-fg">{title ?? '—'}</span>
    </span>
  )
}

export default function Subheading({ children }) {
  return (
    <h3 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-fg-muted after:h-px after:flex-1 after:bg-line">
      {children}
    </h3>
  )
}

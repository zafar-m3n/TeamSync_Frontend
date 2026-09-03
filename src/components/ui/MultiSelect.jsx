import Select from '@/components/ui/Select'

/**
 * App-wide multi-select. Thin wrapper over {@link Select} with `isMulti` on so
 * the shared styling (chips, borders, error state, menu portal) stays identical.
 */
export default function MultiSelect(props) {
  return <Select isMulti {...props} />
}

import ReactSelect from 'react-select'
import clsx from 'clsx'
import { useFieldProps } from '@/components/form/fieldContext'

const menuPortalStyles = { menuPortal: (base) => ({ ...base, zIndex: 70 }) }

const buildSelectClassNames = (invalid) => ({
  control: ({ isFocused, isDisabled }) =>
    clsx(
      'flex min-h-9 items-center rounded-md border pl-2 pr-1 text-sm shadow-xs transition-[border-color,box-shadow] duration-(--duration-fast)',
      isDisabled ? 'cursor-not-allowed border-line bg-surface-subtle text-fg-muted shadow-none' : 'bg-surface',
      isFocused
        ? clsx('shadow-(--focus-ring)', invalid ? 'border-danger' : 'border-brand-600')
        : invalid
          ? 'border-danger'
          : !isDisabled && 'border-line-strong hover:border-fg-muted',
    ),
  valueContainer: () => 'flex flex-wrap items-center gap-1 px-1 py-0.5',
  placeholder: () => 'text-fg-subtle',
  singleValue: () => 'text-fg',
  input: () => 'text-sm text-fg',
  multiValue: () => 'flex items-center rounded-sm bg-brand-50 text-brand-700',
  multiValueLabel: () => 'px-1.5 py-0.5 text-xs font-medium',
  multiValueRemove: () => 'rounded-r-sm px-1 hover:bg-brand-100',
  indicatorsContainer: () => 'flex items-center',
  dropdownIndicator: ({ isFocused }) => clsx('px-1.5', isFocused ? 'text-fg-muted' : 'text-fg-subtle'),
  clearIndicator: () => 'rounded px-1.5 text-fg-subtle hover:text-fg',
  indicatorSeparator: () => 'mx-1 my-1.5 w-px self-stretch bg-line',
  loadingIndicator: () => 'px-1.5 text-fg-subtle',
  menu: () => 'mt-1 overflow-hidden rounded-lg border border-line bg-surface shadow-md',
  menuList: () => 'py-1',
  option: ({ isFocused, isSelected, isDisabled }) =>
    clsx(
      'flex cursor-pointer items-center px-3 py-2 text-sm',
      isDisabled
        ? 'cursor-not-allowed text-fg-subtle'
        : isSelected
          ? 'bg-brand-50 font-medium text-brand-700'
          : isFocused
            ? 'bg-surface-hover text-fg'
            : 'text-fg',
    ),
  noOptionsMessage: () => 'px-3 py-2 text-sm text-fg-muted',
  loadingMessage: () => 'px-3 py-2 text-sm text-fg-muted',
  groupHeading: () => 'px-3 pb-1 pt-2 text-xs font-semibold uppercase text-fg-muted',
})

/**
 * App-wide single-select built on react-select.
 * `error`/`invalid` show the invalid state; inside a FormField the label, id and
 * error message are wired automatically. Any other react-select prop is forwarded.
 */
export default function Select({ error, invalid, id, inputId, styles, classNames, ...props }) {
  const field = useFieldProps({ id: inputId ?? id, invalid: error || invalid || undefined, ...props })
  return (
    <ReactSelect
      unstyled
      inputId={field.id}
      aria-invalid={field.invalid || undefined}
      aria-errormessage={field.invalid ? field.errorId : undefined}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      styles={{ ...menuPortalStyles, ...styles }}
      classNames={{ ...buildSelectClassNames(field.invalid), ...classNames }}
      {...props}
    />
  )
}

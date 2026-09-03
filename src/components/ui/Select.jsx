import ReactSelect from 'react-select'
import clsx from 'clsx'

const menuPortalStyles = { menuPortal: (base) => ({ ...base, zIndex: 60 }) }

const buildSelectClassNames = (error) => ({
  control: ({ isFocused, isDisabled }) =>
    clsx(
      'flex min-h-[38px] items-center rounded-md border pl-2 pr-1 text-sm transition-colors',
      isDisabled ? 'bg-gray-50' : 'bg-white',
      isFocused
        ? 'border-accent ring-2 ring-accent'
        : error
          ? 'border-red-600'
          : 'border-gray-300',
    ),
  valueContainer: () => 'flex flex-wrap items-center gap-1 px-1 py-1',
  placeholder: () => 'text-gray-400',
  singleValue: () => 'text-text',
  input: () => 'text-sm text-text',
  multiValue: () => 'flex items-center rounded bg-gray-100',
  multiValueLabel: () => 'px-1.5 py-0.5 text-xs text-text',
  multiValueRemove: () =>
    'rounded-r px-1 text-gray-500 hover:bg-gray-200 hover:text-text',
  indicatorsContainer: () => 'flex items-center',
  dropdownIndicator: () => 'px-1.5 text-gray-400',
  clearIndicator: () => 'px-1.5 text-gray-400 hover:text-text',
  indicatorSeparator: () => 'mx-1 w-px self-stretch bg-gray-200',
  menu: () =>
    'mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg',
  menuList: () => 'py-1',
  option: ({ isFocused, isSelected }) =>
    clsx(
      'cursor-pointer px-3 py-2 text-sm',
      isSelected
        ? 'bg-accent text-white'
        : isFocused
          ? 'bg-gray-100 text-text'
          : 'text-text',
    ),
  noOptionsMessage: () => 'px-3 py-2 text-sm text-gray-400',
})

/**
 * App-wide single-select built on react-select.
 * Pass `error` to show the invalid border state. Any other react-select prop
 * (options, value, onChange, isDisabled, isClearable, isLoading, filterOption…)
 * is forwarded as-is.
 */
export default function Select({ error = false, styles, classNames, ...props }) {
  return (
    <ReactSelect
      unstyled
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      styles={{ ...menuPortalStyles, ...styles }}
      classNames={{ ...buildSelectClassNames(error), ...classNames }}
      {...props}
    />
  )
}

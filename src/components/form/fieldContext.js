import { createContext, useContext } from 'react'

export const FieldContext = createContext(null)

// Merges a control's own props with the enclosing FormField's id / invalid / describedby,
// so controls rendered through wrappers (e.g. react-hook-form's Controller) stay labelled.
export function useFieldProps({ id, invalid, 'aria-describedby': describedBy, 'aria-invalid': ariaInvalid }) {
  const field = useContext(FieldContext)
  const isInvalid = Boolean(invalid ?? ariaInvalid ?? field?.invalid)
  return {
    id: field?.id ?? id,
    invalid: isInvalid,
    describedBy: describedBy ?? field?.describedBy,
    errorId: field?.errorId,
  }
}

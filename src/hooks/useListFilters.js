import { useCallback, useEffect, useReducer } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'filter':
      if (Object.is(state.filters[action.key], action.value)) return state
      return { filters: { ...state.filters, [action.key]: action.value }, page: 1 }
    case 'page':
      return { ...state, page: typeof action.page === 'function' ? action.page(state.page) : action.page }
    default:
      return state
  }
}

const init = (filters) => ({ filters, page: 1 })

// List page state: filter values plus a page number that resets to 1 whenever a filter changes.
// setPage takes a number or an updater function, like useState.
export function useListFilters(initialFilters) {
  const [{ filters, page }, dispatch] = useReducer(reducer, initialFilters, init)
  const setFilter = useCallback((key, value) => dispatch({ type: 'filter', key, value }), [])
  const setPage = useCallback((next) => dispatch({ type: 'page', page: next }), [])
  return { filters, page, setFilter, setPage }
}

// Applies a typed value to a list filter once it has been stable for `delay` ms.
export function useDebouncedFilter(setFilter, key, value, delay = 300) {
  useEffect(() => {
    const t = setTimeout(() => setFilter(key, value), delay)
    return () => clearTimeout(t)
  }, [setFilter, key, value, delay])
}

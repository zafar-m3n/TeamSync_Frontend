import { useReducer } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'filter':
      return { filters: { ...state.filters, [action.key]: action.value }, page: 1 }
    case 'page':
      return { ...state, page: action.page }
    default:
      return state
  }
}

const init = (filters) => ({ filters, page: 1 })

// List page state: filter values plus a page number that resets to 1 whenever a filter changes.
export function useListFilters(initialFilters) {
  const [{ filters, page }, dispatch] = useReducer(reducer, initialFilters, init)
  return {
    filters,
    page,
    setFilter: (key, value) => dispatch({ type: 'filter', key, value }),
    setPage: (next) => dispatch({ type: 'page', page: next }),
  }
}

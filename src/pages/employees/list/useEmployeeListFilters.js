import { useEffect, useMemo, useReducer } from 'react'
import { LIMIT } from '@/pages/employees/list/employeeListConfig'

const SEARCH_DELAY = 300

const initialState = {
  search: '',
  debouncedSearch: '',
  departmentId: '',
  statusFilter: 'current',
  page: 1,
}

function reducer(state, action) {
  switch (action.type) {
    case 'search':
      return { ...state, search: action.value }
    case 'debouncedSearch':
      // A new search (once debounced) starts again from page 1.
      return action.value === state.debouncedSearch
        ? state
        : { ...state, debouncedSearch: action.value, page: 1 }
    case 'filter':
      return { ...state, [action.key]: action.value, page: 1 }
    case 'page':
      return { ...state, page: action.page }
    default:
      return state
  }
}

export function useEmployeeListFilters() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { search, debouncedSearch, departmentId, statusFilter, page } = state

  useEffect(() => {
    const t = setTimeout(
      () => dispatch({ type: 'debouncedSearch', value: search.trim() }),
      SEARCH_DELAY,
    )
    return () => clearTimeout(t)
  }, [search])

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(departmentId ? { departmentId: Number(departmentId) } : {}),
      ...(statusFilter !== 'current' ? { employmentStatus: statusFilter } : {}),
    }),
    [page, debouncedSearch, departmentId, statusFilter],
  )

  return {
    search,
    departmentId,
    statusFilter,
    page,
    params,
    setSearch: (value) => dispatch({ type: 'search', value }),
    setDepartmentId: (value) => dispatch({ type: 'filter', key: 'departmentId', value }),
    setStatusFilter: (value) => dispatch({ type: 'filter', key: 'statusFilter', value }),
    setPage: (next) => dispatch({ type: 'page', page: next }),
  }
}

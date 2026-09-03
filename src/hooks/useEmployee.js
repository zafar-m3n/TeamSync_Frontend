import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getEmployee,
  updateEmployee,
  assignShift,
  uploadDocument,
  deleteDocument,
} from '@/services/employeeService'
import { toast } from '@/hooks/useToast'

export function useEmployee(id) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployee(id),
    enabled: id != null,
    select: (res) => res.data,
  })
}

export function useUpdateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateEmployee(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useAssignShift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, shiftId }) => assignShift(id, shiftId),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ['employees', id] })
      toast.success('Shift assigned')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }) => uploadDocument(id, formData),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ['employees', id] })
      toast.success('Document uploaded')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, documentId }) => deleteDocument(id, documentId),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ['employees', id] })
      toast.success('Document deleted')
    },
    onError: (error) => toast.error(error.message),
  })
}

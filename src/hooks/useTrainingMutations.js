import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadDocument } from '@/services/trainingDocumentService'
import {
  createAssignment,
  removeAssignment,
} from '@/services/trainingAssignmentService'
import { toast } from '@/hooks/useToast'

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData) => uploadDocument(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training'] })
      toast.success('Document uploaded')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useCreateAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createAssignment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training'] })
      toast.success('Training assigned')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useRemoveAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => removeAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training'] })
      toast.success('Assignment removed')
    },
    onError: (error) => toast.error(error.message),
  })
}

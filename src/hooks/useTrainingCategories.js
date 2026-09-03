import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getTrainingCategories,
  createTrainingCategory,
  updateTrainingCategory,
  deleteTrainingCategory,
} from '../services/trainingCategoryService'
import { toast } from './useToast'

export function useTrainingCategories() {
  return useQuery({
    queryKey: ['training-categories'],
    queryFn: getTrainingCategories,
    select: (res) => res.data ?? [],
  })
}

export function useCreateTrainingCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createTrainingCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training-categories'] })
      toast.success('Training category created')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateTrainingCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateTrainingCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training-categories'] })
      toast.success('Training category updated')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useDeleteTrainingCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteTrainingCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training-categories'] })
      toast.success('Training category deleted')
    },
    // error.message is the backend's verbatim text (e.g. CATEGORY_IN_USE).
    onError: (error) => toast.error(error.message),
  })
}

import { useReducer } from 'react'
import { ALL_STEPS, STEP_LABELS, TOTAL_STEPS } from '@/pages/employees/form/employeeFormSchema'

const initialState = { currentStep: 1, visitedSteps: new Set() }

const goTo = (state, step) => ({ ...state, currentStep: step })

function reducer(state, action) {
  switch (action.type) {
    case 'goTo':
      return goTo(state, action.step)
    case 'next':
      return goTo(state, Math.min(TOTAL_STEPS, state.currentStep + 1))
    case 'back':
      return goTo(state, Math.max(1, state.currentStep - 1))
    case 'visit':
      return { ...state, visitedSteps: new Set(state.visitedSteps).add(action.step) }
    case 'visitAll':
      return { ...state, visitedSteps: new Set(ALL_STEPS) }
    default:
      return state
  }
}

const stepHasError = (fields, errorKeys) =>
  fields.some((name) => errorKeys.includes(name.split('.')[0]))

// stepFields: { [step]: field names } from employeeFormSchema.
export function useEmployeeWizard(stepFields) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { currentStep, visitedSteps } = state

  const stepStatus = (step, errorKeys) => {
    if (step === currentStep) return 'current'
    if (!visitedSteps.has(step) && step > currentStep) return 'upcoming'
    return stepHasError(stepFields[step], errorKeys) ? 'error' : 'complete'
  }

  return {
    ...state,
    isLastStep: currentStep === TOTAL_STEPS,
    currentFields: stepFields[currentStep],
    stepperSteps: (errors) =>
      ALL_STEPS.map((n) => ({ label: STEP_LABELS[n], status: stepStatus(n, Object.keys(errors)) })),
    goTo: (step) => dispatch({ type: 'goTo', step }),
    next: () => dispatch({ type: 'next' }),
    back: () => dispatch({ type: 'back' }),
    visit: (step) => dispatch({ type: 'visit', step }),
    // Marks every step visited and jumps to the lowest-numbered step with an error.
    showFirstError: (errors) => {
      dispatch({ type: 'visitAll' })
      const step = ALL_STEPS.find((n) => stepHasError(stepFields[n], Object.keys(errors)))
      if (step) dispatch({ type: 'goTo', step })
    },
  }
}

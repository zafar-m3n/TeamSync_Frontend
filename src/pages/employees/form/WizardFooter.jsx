import { Icon } from '@iconify/react'
import Button from '@/components/ui/Button'

export default function WizardFooter({ showBack, isLastStep, isPending, submitLabel, onBack, onNext }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-8 flex items-center justify-end gap-3 rounded-b-lg border-t border-line bg-surface/95 px-5 py-4 backdrop-blur-sm sm:-mx-8 sm:-mb-8 sm:px-8">
      {showBack && (
        <Button type="button" variant="secondary" onClick={onBack} disabled={isPending} className="mr-auto">
          <Icon icon="lucide:arrow-left" width="16" height="16" aria-hidden />
          Back
        </Button>
      )}
      {/* Distinct keys: reusing one <button> would flip it to type="submit"
          mid-click on the last Next, submitting the form and skipping banking. */}
      {isLastStep ? (
        <Button key="submit" type="submit" variant="primary" isLoading={isPending}>
          <Icon icon="lucide:check" width="16" height="16" aria-hidden />
          {submitLabel}
        </Button>
      ) : (
        <Button key="next" type="button" variant="primary" onClick={onNext}>
          Next
          <Icon icon="lucide:arrow-right" width="16" height="16" aria-hidden />
        </Button>
      )}
    </div>
  )
}

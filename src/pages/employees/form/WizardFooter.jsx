import Button from '@/components/ui/Button'

export default function WizardFooter({ showBack, isLastStep, isPending, submitLabel, onBack, onNext }) {
  return (
    <div className="sticky bottom-0 z-10 -mb-6 mt-8 flex items-center justify-end gap-3 border-t border-gray-200 bg-white pb-6 pt-4 sm:-mb-8 sm:pb-8">
      {showBack && (
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isPending}
          className="mr-auto"
        >
          Back
        </Button>
      )}
      {/* Distinct keys: reusing one <button> would flip it to type="submit"
          mid-click on the last Next, submitting the form and skipping banking. */}
      {isLastStep ? (
        <Button key="submit" type="submit" variant="accent" isLoading={isPending}>
          {submitLabel}
        </Button>
      ) : (
        <Button key="next" type="button" variant="accent" onClick={onNext}>
          Next
        </Button>
      )}
    </div>
  )
}

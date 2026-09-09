import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'

// All banking fields are optional on the backend — no `required` flags here.
export default function BankingFields({ register }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Bank Name">
        <Input placeholder="First National Bank" {...register('banking.bankName')} />
      </FormField>
      <FormField label="Account Holder Name">
        <Input placeholder="Jordan Rivera" {...register('banking.accountHolderName')} />
      </FormField>
      <FormField label="Account Number">
        <Input placeholder="0123456789" {...register('banking.accountNumber')} />
      </FormField>
      <FormField label="Bank Branch">
        <Input placeholder="Downtown Branch" {...register('banking.bankBranch')} />
      </FormField>
    </div>
  )
}

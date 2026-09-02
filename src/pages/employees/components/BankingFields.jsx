import FormField from '../../../components/form/FormField'
import Input from '../../../components/form/Input'

// All banking fields are optional on the backend — no `required` flags here.
export default function BankingFields({ register }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Bank Name">
        <Input {...register('banking.bankName')} />
      </FormField>
      <FormField label="Account Holder Name">
        <Input {...register('banking.accountHolderName')} />
      </FormField>
      <FormField label="Account Number">
        <Input {...register('banking.accountNumber')} />
      </FormField>
      <FormField label="Bank Branch">
        <Input {...register('banking.bankBranch')} />
      </FormField>
    </div>
  )
}

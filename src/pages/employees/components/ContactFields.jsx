import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'

// All contact fields are optional on the backend — no `required` flags here.
export default function ContactFields({ register }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Address Line 1">
        <Input {...register('contact.addressLine1')} />
      </FormField>
      <FormField label="Address Line 2">
        <Input {...register('contact.addressLine2')} />
      </FormField>
      <FormField label="State">
        <Input {...register('contact.state')} />
      </FormField>
      <FormField label="Country">
        <Input {...register('contact.country')} />
      </FormField>
      <FormField label="Postal Code">
        <Input {...register('contact.postalCode')} />
      </FormField>
      <FormField label="Emergency Contact Name">
        <Input {...register('contact.emergencyContactName')} />
      </FormField>
      <FormField label="Emergency Contact Relationship">
        <Input {...register('contact.emergencyContactRelationship')} />
      </FormField>
      <FormField label="Emergency Contact Phone">
        <Input {...register('contact.emergencyContactPhone')} />
      </FormField>
    </div>
  )
}

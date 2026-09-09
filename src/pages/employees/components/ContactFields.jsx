import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'

function GroupLabel({ children }) {
  return (
    <p className="border-b border-gray-100 pb-1.5 text-sm font-semibold text-primary">
      {children}
    </p>
  )
}

// All contact fields are optional on the backend — no `required` flags here.
export default function ContactFields({ register }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <GroupLabel>Address</GroupLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Address Line 1">
            <Input placeholder="1240 Larkspur Avenue" {...register('contact.addressLine1')} />
          </FormField>
          <FormField label="Address Line 2">
            <Input placeholder="Apt 4B" {...register('contact.addressLine2')} />
          </FormField>
          <FormField label="State">
            <Input placeholder="California" {...register('contact.state')} />
          </FormField>
          <FormField label="Country">
            <Input placeholder="United States" {...register('contact.country')} />
          </FormField>
          <FormField label="Postal Code">
            <Input placeholder="94103" {...register('contact.postalCode')} />
          </FormField>
        </div>
      </div>

      <div className="space-y-3">
        <GroupLabel>Emergency contact</GroupLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Emergency Contact Name">
            <Input placeholder="Morgan Rivera" {...register('contact.emergencyContactName')} />
          </FormField>
          <FormField label="Emergency Contact Relationship">
            <Input placeholder="Spouse" {...register('contact.emergencyContactRelationship')} />
          </FormField>
          <FormField label="Emergency Contact Phone">
            <Input placeholder="+1 415 555 0188" {...register('contact.emergencyContactPhone')} />
          </FormField>
        </div>
      </div>
    </div>
  )
}

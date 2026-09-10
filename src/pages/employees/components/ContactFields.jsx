import { Controller } from 'react-hook-form'
import Select from '@/components/ui/Select'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'

const RELATIONSHIP_OPTIONS = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Other', label: 'Other' },
]

function GroupLabel({ children }) {
  return (
    <p className="border-b border-gray-100 pb-1.5 text-sm font-semibold text-primary">
      {children}
    </p>
  )
}

// All contact fields are optional on the backend — no `required` flags here.
// Every field uses register() except emergencyContactRelationship, which is a
// restricted Select and therefore needs Controller + `control`.
export default function ContactFields({ register, control }) {
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
            <Controller
              control={control}
              name="contact.emergencyContactRelationship"
              render={({ field }) => (
                <Select
                  isClearable
                  options={RELATIONSHIP_OPTIONS}
                  placeholder="Select a relationship…"
                  value={
                    RELATIONSHIP_OPTIONS.find((o) => o.value === field.value) ?? null
                  }
                  onChange={(opt) => field.onChange(opt?.value ?? '')}
                  onBlur={field.onBlur}
                />
              )}
            />
          </FormField>
          <FormField label="Emergency Contact Phone">
            <Input placeholder="+1 415 555 0188" {...register('contact.emergencyContactPhone')} />
          </FormField>
        </div>
      </div>
    </div>
  )
}

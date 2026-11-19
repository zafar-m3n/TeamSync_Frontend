import { Controller } from 'react-hook-form'
import Select from '@/components/ui/Select'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import GroupLabel from '@/pages/employees/form/Subheading'

const RELATIONSHIP_OPTIONS = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Other', label: 'Other' },
]


// All contact fields are optional on the backend — no `required` flags here.
// Every field uses register() except emergencyContactRelationship, which is a
// restricted Select and therefore needs Controller + `control`.
export default function ContactFields({ register, control }) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <GroupLabel>Address</GroupLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Address Line 1">
            <Input placeholder="Enter street address" {...register('contact.addressLine1')} />
          </FormField>
          <FormField label="Address Line 2">
            <Input placeholder="Apartment, suite or floor" {...register('contact.addressLine2')} />
          </FormField>
          <FormField label="State">
            <Input placeholder="Enter state or province" {...register('contact.state')} />
          </FormField>
          <FormField label="Country">
            <Input placeholder="Enter country" {...register('contact.country')} />
          </FormField>
          <FormField label="Postal Code">
            <Input placeholder="Enter postal code" {...register('contact.postalCode')} />
          </FormField>
        </div>
      </div>

      <div className="space-y-4">
        <GroupLabel>Emergency contact</GroupLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Emergency Contact Name">
            <Input placeholder="Enter contact's full name" {...register('contact.emergencyContactName')} />
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
            <Input placeholder="Enter phone number, e.g. +94 77 123 4567" {...register('contact.emergencyContactPhone')} />
          </FormField>
        </div>
      </div>
    </div>
  )
}

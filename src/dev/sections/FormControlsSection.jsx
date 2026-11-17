import { useState } from 'react'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Select from '@/components/ui/Select'
import MultiSelect from '@/components/ui/MultiSelect'
import Checkbox from '@/components/ui/Checkbox'
import Spinner from '@/components/ui/Spinner'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Textarea from '@/components/form/Textarea'
import { DateField, DateRangeField } from '@/components/form/DatePicker'

const BUTTON_VARIANTS = ['primary', 'secondary', 'danger', 'success', 'dark', 'ghost']
const ICON_VARIANTS = ['secondary', 'accent', 'success', 'danger', 'ghost', 'ghost-danger', 'primary']
const OPTIONS = [
  { value: 'eng', label: 'Engineering' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'ops', label: 'Operations' },
  { value: 'fin', label: 'Finance', isDisabled: true },
]

function Card({ title, children }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-fg-muted">{title}</h3>
      {children}
    </div>
  )
}

export default function FormControlsSection() {
  const [text, setText] = useState('')
  const [dept, setDept] = useState(null)
  const [multi, setMulti] = useState([OPTIONS[0]])
  const [date, setDate] = useState('')
  const [dob, setDob] = useState('1994-03-12')
  const [range, setRange] = useState()
  const [checks, setChecks] = useState({ a: true, b: false })

  return (
    <div className="flex flex-col gap-6">
      <Card title="Button: variants × sizes, loading, disabled">
        <div className="flex flex-col gap-3">
          {['sm', 'md', 'lg'].map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-2">
              <span className="w-8 font-mono text-xs text-fg-subtle">{size}</span>
              {BUTTON_VARIANTS.map((v) => (
                <Button key={v} variant={v} size={size}>
                  {v}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-8 font-mono text-xs text-fg-subtle">state</span>
            <Button isLoading>Saving</Button>
            <Button variant="secondary" isLoading>
              Loading
            </Button>
            <Button disabled>Disabled</Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
        </div>
      </Card>

      <Card title="IconButton: variants × sizes, loading, disabled">
        <div className="flex flex-col gap-3">
          {['sm', 'md', 'lg'].map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-2">
              <span className="w-8 font-mono text-xs text-fg-subtle">{size}</span>
              {ICON_VARIANTS.map((v) => (
                <IconButton key={v} variant={v} size={size} icon="lucide:pencil" label={`${v} action`} />
              ))}
              <IconButton size={size} icon="lucide:trash-2" label="Loading" isLoading />
              <IconButton size={size} icon="lucide:trash-2" label="Disabled" variant="danger" disabled />
            </div>
          ))}
          <div className="flex items-center gap-3 text-fg-muted">
            <Spinner size="sm" /> <Spinner /> <Spinner size="lg" className="text-brand-600" />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Input & Textarea">
          <div className="flex flex-col gap-4">
            <FormField label="Full name" required hint="As it appears on official documents.">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Sara Ahmed" />
            </FormField>
            <FormField label="Employee code" error="This code is already taken.">
              <Input defaultValue="EMP-001" />
            </FormField>
            <FormField label="Disabled">
              <Input defaultValue="Can't edit this" disabled />
            </FormField>
            <FormField label="Read only">
              <Input defaultValue="Read-only value" readOnly />
            </FormField>
            <FormField label="Start time">
              <Input type="time" defaultValue="09:00" />
            </FormField>
            <FormField label="Reason" hint="Optional. Visible to your manager.">
              <Textarea placeholder="Add a note…" />
            </FormField>
            <FormField label="Reason (legacy multiline Input)" error="Reason is required.">
              <Input multiline rows={3} />
            </FormField>
          </div>
        </Card>

        <Card title="Select, MultiSelect, DatePicker, Checkbox">
          <div className="flex flex-col gap-4">
            <FormField label="Department" required hint="Controls the default shift.">
              <Select options={OPTIONS} value={dept} onChange={setDept} placeholder="Select department" isClearable />
            </FormField>
            <FormField label="Department (error)" error="Department is required.">
              <Select options={OPTIONS} placeholder="Select department" />
            </FormField>
            <FormField label="Disabled select">
              <Select options={OPTIONS} value={OPTIONS[1]} isDisabled />
            </FormField>
            <FormField label="Loading select">
              <Select options={[]} isLoading placeholder="Loading…" />
            </FormField>
            <FormField label="Working days">
              <MultiSelect options={OPTIONS} value={multi} onChange={setMulti} />
            </FormField>
            <FormField label="Start date" hint="Popover opens in a portal, so cards can't clip it.">
              <DateField value={date} onChange={setDate} />
            </FormField>
            <FormField label="Date of birth (dropdown nav, clearable)" error={dob ? undefined : 'Date of birth is required.'}>
              <DateField value={dob} onChange={setDob} clearable withDropdownNav />
            </FormField>
            <FormField label="Date range">
              <DateRangeField value={range} onChange={setRange} />
            </FormField>
            <FormField label="Disabled date">
              <DateField value="2026-11-17" onChange={() => {}} disabled />
            </FormField>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <Checkbox checked={checks.a} onChange={(e) => setChecks((c) => ({ ...c, a: e.target.checked }))} /> Checked
              </label>
              <label className="inline-flex items-center gap-2">
                <Checkbox checked={checks.b} onChange={(e) => setChecks((c) => ({ ...c, b: e.target.checked }))} /> Unchecked
              </label>
              <span className="inline-flex items-center gap-2">
                <Checkbox checked disabled /> Disabled
              </span>
              <span className="inline-flex items-center gap-2">
                <Checkbox locked /> Locked
              </span>
              <span className="inline-flex items-center gap-2">
                <Checkbox checked pending onChange={() => {}} /> Pending
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-fg-muted">Clipping check: overflow-hidden card, date field at the bottom</h3>
        <div className="w-64">
          <DateField value={date} onChange={setDate} />
        </div>
      </div>
    </div>
  )
}

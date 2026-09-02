import { useState } from 'react'
import Button from './components/ui/Button'
import Badge from './components/ui/Badge'
import Modal from './components/ui/Modal'
import Table from './components/ui/Table'
import TableSkeleton from './components/ui/TableSkeleton'
import Spinner from './components/ui/Spinner'
import Input from './components/form/Input'
import FormField from './components/form/FormField'
import { useToast } from './hooks/useToast'

const buttonVariants = ['primary', 'accent', 'secondary', 'danger', 'success', 'dark']
const badgeTones = ['neutral', 'success', 'warning', 'danger', 'info']

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'department', header: 'Department', sortable: true },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
]

const sampleRows = [
  { id: 1, name: 'Amara Okafor', department: 'Engineering', role: 'Backend Developer', status: <Badge tone="success">Active</Badge> },
  { id: 2, name: 'Ravi Menon', department: 'People Ops', role: 'HR Generalist', status: <Badge tone="success">Active</Badge> },
  { id: 3, name: 'Lena Fischer', department: 'Design', role: 'Product Designer', status: <Badge tone="warning">On leave</Badge> },
  { id: 4, name: 'Diego Santos', department: 'Sales', role: 'Account Executive', status: <Badge tone="danger">Deactivated</Badge> },
]

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-2xl text-primary">{title}</h2>
      {children}
    </section>
  )
}

export default function App() {
  const toast = useToast()
  const [isModalOpen, setModalOpen] = useState(false)
  const [sortState, setSortState] = useState({ key: 'name', direction: 'asc' })

  const handleSort = (key) => {
    setSortState((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-4xl text-primary">TeamSync Design System</h1>
          <p className="text-sm text-gray-500">
            Temporary showcase for Phase 1 visual QA — replaced by real routing in Phase 2.
          </p>
        </header>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            {buttonVariants.map((variant) => (
              <Button key={variant} variant={variant} onClick={() => toast.info(`${variant} clicked`)}>
                {variant}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" isLoading>Loading</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Form fields">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Full name" required>
              <Input placeholder="Jane Doe" />
            </FormField>
            <FormField label="Work email" required error="Enter a valid email address">
              <Input placeholder="jane@company.com" defaultValue="not-an-email" />
            </FormField>
            <FormField label="Notes">
              <Input multiline placeholder="Optional context…" />
            </FormField>
            <FormField label="Notes (error)" error="This field is required">
              <Input multiline placeholder="Optional context…" />
            </FormField>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap items-center gap-3">
            {badgeTones.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </div>
        </Section>

        <Section title="Spinner">
          <div className="flex items-center gap-6 text-primary">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Section>

        <Section title="Table">
          <Table
            columns={columns}
            rows={sampleRows}
            sortState={sortState}
            onSort={handleSort}
          />
        </Section>

        <Section title="Table — empty state">
          <Table
            columns={columns}
            rows={[]}
            emptyMessage="No employees yet — add your first employee."
            emptyAction={<Button variant="accent" size="sm">Add employee</Button>}
          />
        </Section>

        <Section title="Table — loading skeleton">
          <TableSkeleton columns={columns} rows={4} />
        </Section>

        <Section title="Modal">
          <Button variant="dark" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
        </Section>

        <Section title="Toasts">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="success" onClick={() => toast.success('Employee saved successfully.')}>
              Success toast
            </Button>
            <Button variant="danger" onClick={() => toast.error('Something went wrong. Try again.')}>
              Error toast
            </Button>
            <Button variant="accent" onClick={() => toast.info('Attendance sync is running.')}>
              Info toast
            </Button>
            <Button variant="secondary" onClick={() => toast.warning('This leave request is pending approval.')}>
              Warning toast
            </Button>
          </div>
        </Section>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Deactivate employee"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setModalOpen(false)
                toast.success('Employee deactivated.')
              }}
            >
              Deactivate
            </Button>
          </>
        }
      >
        <p>
          This will revoke the employee&rsquo;s access immediately. Their records stay
          intact and can be reactivated later.
        </p>
      </Modal>
    </div>
  )
}

import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Tabs, { TabPanel } from '@/components/ui/Tabs'
import { buttonBase, buttonVariants } from '@/components/ui/buttonStyles'
import { STATUS_TONE } from '@/pages/employees/utils/employmentStatus'
import ShiftAssignControl from '@/pages/employees/components/ShiftAssignControl'
import EmployeeDocumentsList from '@/pages/employees/components/EmployeeDocumentsList'
import DeleteEmployeeDialog from '@/pages/employees/list/DeleteEmployeeDialog'
import { useAuth } from '@/store/useAuth'
import { outranks } from '@/lib/permissions'
import { usePageEnter } from '@/hooks/useMotion'

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

function Field({ label, value, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-fg-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-fg">{children ?? (value || <span className="text-fg-subtle">—</span>)}</dd>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Icon icon={icon} width="15" height="15" aria-hidden />
          </span>
          {title}
        </span>
      }
    >
      {children}
    </Card>
  )
}

const fieldGrid = 'grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'

// Bare (no card wrapper) shift control for the sidebar: badge + progressive
// "Change" disclosure of the existing assign control.
function SidebarShift({ data, canEdit }) {
  const [changing, setChanging] = useState(false)
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {data.shift?.name ? (
          <Badge tone="neutral">{data.shift.name}</Badge>
        ) : (
          <span className="text-sm text-fg-subtle">No shift assigned</span>
        )}
        {canEdit && !changing && (
          <button
            type="button"
            onClick={() => setChanging(true)}
            className="rounded text-cell font-medium text-brand-700 transition-colors hover:text-brand-600 hover:underline focus-visible:focus-ring"
          >
            Change
          </button>
        )}
      </div>
      {canEdit && changing && (
        <div className="mt-2">
          <ShiftAssignControl employeeId={data.id} currentShiftId={data.shift?.id ?? null} />
        </div>
      )}
    </div>
  )
}

const TABS = [
  { key: 'basic', label: 'Basic' },
  { key: 'employment', label: 'Employment' },
  { key: 'contact', label: 'Contact' },
  { key: 'banking', label: 'Banking' },
  { key: 'documents', label: 'Documents' },
]

const TABS_ID = 'employee-detail'

export default function EmployeeDetailView({ data, canEdit, editHref, heading }) {
  // The view_team response is the limited {id, fullName, department, designation}
  // shape and omits `documents`; the full view_all/view_own shape includes it.
  // Detect on the payload, never on the current user's role or the route taken.
  const isFull = data && Array.isArray(data.documents)

  const { user, can } = useAuth()
  const navigate = useNavigate()
  // Gated independently of `canEdit` — same roles today, but a distinct check.
  const canDelete = can('employees', 'delete')

  const [activeKey, setActiveKey] = useState('basic')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const panelRef = useRef(null)
  usePageEnter(panelRef, activeKey)

  if (!isFull) {
    return (
      <div className="mx-auto max-w-xl">
        <Card padding="none">
          <div className="flex items-center gap-4 border-b border-line px-5 py-5">
            <Avatar name={data?.fullName} size="lg" />
            <h2 className="font-display text-2xl font-semibold leading-tight text-fg">{heading || data?.fullName || 'Employee'}</h2>
          </div>
          <dl className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <Field label="Name" value={data?.fullName} />
            <Field label="Department" value={data?.department?.name ?? data?.department} />
            <Field label="Designation" value={data?.designation} />
          </dl>
        </Card>
      </div>
    )
  }

  const headerBadges = [
    data.employmentStatus ? { key: 'status', tone: STATUS_TONE[data.employmentStatus], label: data.employmentStatus, dot: true } : null,
    data.role?.name ? { key: 'role', tone: 'info', label: data.role.name } : null,
    data.department?.name ? { key: 'department', tone: 'neutral', label: data.department.name } : null,
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-72">
        <Card padding="none">
          <div className="flex flex-col items-start gap-3 p-5">
            <Avatar name={data.fullName} size="lg" />
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold leading-tight text-fg">{heading || data.fullName}</h2>
              {headerBadges.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {headerBadges.map((b) => (
                    <Badge key={b.key} tone={b.tone} dot={b.dot}>
                      {b.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {((canEdit && editHref) || (canDelete && data.userId !== user.id && outranks(user, data.role))) && (
              <div className="flex w-full gap-2 pt-1">
                {canEdit && editHref && (
                  <Link to={editHref} className={clsx(buttonBase, buttonVariants.primary, 'h-9 flex-1 gap-2 rounded-md px-4 text-sm')}>
                    <Icon icon="lucide:pencil" width="15" height="15" aria-hidden />
                    Edit
                  </Link>
                )}
                {canDelete && data.userId !== user.id && outranks(user, data.role) && (
                  <Button variant="secondary" className="flex-1 text-danger hover:text-danger" onClick={() => setDeleteOpen(true)}>
                    <Icon icon="lucide:trash-2" width="15" height="15" aria-hidden />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          <dl className="space-y-4 border-t border-line p-5">
            <Field label="Employee Code" value={data.employeeCode} />
            <Field label="Manager" value={data.manager?.fullName} />
            <Field label="Date of Joining" value={fmtDate(data.dateOfJoining)} />
            {data.terminationDate && <Field label="Termination Date" value={fmtDate(data.terminationDate)} />}
            <Field label="Shift">
              <SidebarShift data={data} canEdit={canEdit} />
            </Field>
          </dl>
        </Card>
      </aside>

      <div className="min-w-0 flex-1 space-y-5">
        <Tabs id={TABS_ID} tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />

        <TabPanel id={TABS_ID} activeKey={activeKey}>
          <div ref={panelRef}>
            {activeKey === 'basic' && (
              <Section title="Basic Information" icon="lucide:user">
                <dl className={fieldGrid}>
                  <Field label="Full Name" value={data.fullName} />
                  <Field label="Email" value={data.email} />
                  <Field label="Date of Birth" value={fmtDate(data.dob)} />
                  <Field label="Gender" value={data.gender} />
                  <Field label="Phone" value={data.phone} />
                </dl>
              </Section>
            )}

            {activeKey === 'employment' && (
              <Section title="Employment Details" icon="lucide:briefcase">
                <dl className={fieldGrid}>
                  <Field label="Designation" value={data.designation} />
                  <Field label="Employment Type" value={data.employmentType} />
                  <Field label="Status" value={data.employmentStatus} />
                  {data.terminationDate && <Field label="Termination Date" value={fmtDate(data.terminationDate)} />}
                </dl>
              </Section>
            )}

            {activeKey === 'contact' && (
              <Section title="Contact Information" icon="lucide:map-pin">
                <dl className={fieldGrid}>
                  <Field label="Address Line 1" value={data.contact?.addressLine1} />
                  <Field label="Address Line 2" value={data.contact?.addressLine2} />
                  <Field label="State" value={data.contact?.state} />
                  <Field label="Country" value={data.contact?.country} />
                  <Field label="Postal Code" value={data.contact?.postalCode} />
                  <Field label="Emergency Contact Name" value={data.contact?.emergencyContactName} />
                  <Field label="Emergency Contact Relationship" value={data.contact?.emergencyContactRelationship} />
                  <Field label="Emergency Contact Phone" value={data.contact?.emergencyContactPhone} />
                </dl>
              </Section>
            )}

            {activeKey === 'banking' && (
              <Section title="Banking Information" icon="lucide:credit-card">
                <dl className={fieldGrid}>
                  <Field label="Bank Name" value={data.banking?.bankName} />
                  <Field label="Account Holder Name" value={data.banking?.accountHolderName} />
                  <Field label="Account Number" value={data.banking?.accountNumber} />
                  <Field label="Bank Branch" value={data.banking?.bankBranch} />
                </dl>
              </Section>
            )}

            {activeKey === 'documents' && (
              <Section title="Documents" icon="lucide:folder">
                <EmployeeDocumentsList employeeId={data.id} documents={data.documents} canEdit={canEdit} />
              </Section>
            )}
          </div>
        </TabPanel>
      </div>

      <DeleteEmployeeDialog
        employee={deleteOpen ? data : null}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => navigate('/employees')}
      />
    </div>
  )
}

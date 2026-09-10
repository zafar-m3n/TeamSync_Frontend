import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Tabs from '@/components/ui/Tabs'
import ShiftAssignControl from '@/pages/employees/components/ShiftAssignControl'
import EmployeeDocumentsList from '@/pages/employees/components/EmployeeDocumentsList'
import { useAuth } from '@/store/AuthContext'
import { hasPermission } from '@/lib/permissions'
import { useDeleteEmployee } from '@/hooks/useEmployees'
import { toast } from '@/hooks/useToast'

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

function getInitials(source) {
  const parts = String(source || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Avatar({ name }) {
  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xl font-semibold text-accent">
      {getInitials(name)}
    </span>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-text">{value || '—'}</dd>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg text-primary">
        {icon && (
          <Icon icon={icon} width="18" height="18" className="shrink-0 text-accent" aria-hidden />
        )}
        <span>{title}</span>
      </h2>
      {children}
    </section>
  )
}

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
          <span className="text-sm text-gray-400">No shift assigned</span>
        )}
        {canEdit && !changing && (
          <button
            type="button"
            onClick={() => setChanging(true)}
            className="rounded text-sm font-medium text-accent transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Change
          </button>
        )}
      </div>
      {canEdit && changing && (
        <div className="mt-2">
          <ShiftAssignControl
            employeeId={data.id}
            currentShiftId={data.shift?.id ?? null}
          />
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

export default function EmployeeDetailView({ data, canEdit, editHref, heading }) {
  // The view_team response is the limited {id, fullName, department, designation}
  // shape and omits `documents`; the full view_all/view_own shape includes it.
  // Detect on the payload, never on the current user's role or the route taken.
  const isFull = data && Array.isArray(data.documents)

  const { user } = useAuth()
  const navigate = useNavigate()
  const roleSeg = user.roleName.toLowerCase()
  // Gated independently of `canEdit` — same roles today, but a distinct check.
  const canDelete = hasPermission(user.roleName, 'employees', 'delete')
  const deleteMutation = useDeleteEmployee()

  const [activeKey, setActiveKey] = useState('basic')
  const [entered, setEntered] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [activeKey])

  const changeTab = (key) => {
    if (key === activeKey) return
    setEntered(false)
    setActiveKey(key)
  }

  if (!isFull) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={data?.fullName} />
          <h1 className="font-display text-3xl leading-tight text-primary">
            {heading || data?.fullName || 'Employee'}
          </h1>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={data?.fullName} />
            <Field
              label="Department"
              value={data?.department?.name ?? data?.department}
            />
            <Field label="Designation" value={data?.designation} />
          </dl>
        </div>
      </div>
    )
  }

  const headerBadges = [
    data.role?.name ? { key: 'role', tone: 'info', label: data.role.name } : null,
    data.department?.name
      ? { key: 'department', tone: 'neutral', label: data.department.name }
      : null,
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-72">
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <Avatar name={data.fullName} />
            <div>
              <h1 className="font-display text-2xl leading-tight text-primary">
                {heading || data.fullName}
              </h1>
              {headerBadges.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {headerBadges.map((b) => (
                    <Badge key={b.key} tone={b.tone}>
                      {b.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {canEdit && editHref && (
            <Link
              to={editHref}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Edit
            </Link>
          )}

          {canDelete && data.userId !== user.id && (
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}

          <dl className="space-y-3 border-t border-gray-100 pt-4">
            <Field label="Employee Code" value={data.employeeCode} />
            <Field label="Manager" value={data.manager?.fullName} />
            <Field label="Date of Joining" value={fmtDate(data.dateOfJoining)} />
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">Shift</dt>
              <dd className="mt-1">
                <SidebarShift data={data} canEdit={canEdit} />
              </dd>
            </div>
          </dl>
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        <div className="overflow-x-auto">
          <Tabs tabs={TABS} activeKey={activeKey} onChange={changeTab} />
        </div>

        <div
          className={clsx(
            'transition-opacity duration-150 ease-out motion-reduce:transition-none',
            entered ? 'opacity-100' : 'opacity-0',
          )}
        >
          {activeKey === 'basic' && (
            <Section title="Basic Information" icon="lucide:user">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Full Name" value={data.fullName} />
                <Field label="Email" value={data.email} />
                <Field label="Date of Birth" value={fmtDate(data.dateOfBirth)} />
                <Field label="Gender" value={data.gender} />
                <Field label="Phone" value={data.phone} />
              </dl>
            </Section>
          )}

          {activeKey === 'employment' && (
            <Section title="Employment Details" icon="lucide:briefcase">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Designation" value={data.designation} />
                <Field label="Employment Type" value={data.employmentType} />
              </dl>
            </Section>
          )}

          {activeKey === 'contact' && (
            <Section title="Contact Information" icon="lucide:map-pin">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Address Line 1" value={data.contact?.addressLine1} />
                <Field label="Address Line 2" value={data.contact?.addressLine2} />
                <Field label="State" value={data.contact?.state} />
                <Field label="Country" value={data.contact?.country} />
                <Field label="Postal Code" value={data.contact?.postalCode} />
                <Field label="Emergency Contact Name" value={data.contact?.emergencyContactName} />
                <Field
                  label="Emergency Contact Relationship"
                  value={data.contact?.emergencyContactRelationship}
                />
                <Field label="Emergency Contact Phone" value={data.contact?.emergencyContactPhone} />
              </dl>
            </Section>
          )}

          {activeKey === 'banking' && (
            <Section title="Banking Information" icon="lucide:credit-card">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Bank Name" value={data.banking?.bankName} />
                <Field label="Account Holder Name" value={data.banking?.accountHolderName} />
                <Field label="Account Number" value={data.banking?.accountNumber} />
                <Field label="Bank Branch" value={data.banking?.bankBranch} />
              </dl>
            </Section>
          )}

          {activeKey === 'documents' && (
            <Section title="Documents" icon="lucide:folder">
              <EmployeeDocumentsList
                employeeId={data.id}
                documents={data.documents}
                canEdit={canEdit}
              />
            </Section>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete employee"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate(data.id, {
                  onSuccess: () => {
                    toast.success(`${data.fullName} deleted`)
                    navigate(`/${roleSeg}/employees`)
                  },
                })
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Delete <strong>{data.fullName}</strong>? This can’t be undone.
        </p>
      </Modal>
    </div>
  )
}

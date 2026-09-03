import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import ShiftAssignControl from '@/pages/employees/components/ShiftAssignControl'
import EmployeeDocumentsList from '@/pages/employees/components/EmployeeDocumentsList'

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, 'PP')
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-text">{value || '—'}</dd>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-lg text-primary">{title}</h2>
      {children}
    </section>
  )
}

export default function EmployeeDetailView({ data, canEdit, editHref, heading }) {
  // The view_team response is the limited {id, fullName, department, designation}
  // shape and omits `documents`; the full view_all/view_own shape includes it.
  // Detect on the payload, never on the current user's role or the route taken.
  const isFull = data && Array.isArray(data.documents)

  if (!isFull) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl text-primary">
          {heading || data?.fullName || 'Employee'}
        </h1>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl text-primary">
          {heading || data.fullName}
        </h1>
        {canEdit && editHref && (
          <Link
            to={editHref}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Edit
          </Link>
        )}
      </div>

      <Section title="Basic Information">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Full Name" value={data.fullName} />
          <Field label="Employee Code" value={data.employeeCode} />
          <Field label="Email" value={data.email} />
          <Field label="Date of Birth" value={fmtDate(data.dateOfBirth)} />
          <Field label="Gender" value={data.gender} />
          <Field label="Phone" value={data.phone} />
        </dl>
      </Section>

      <Section title="Employment Details">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Department" value={data.department?.name} />
          <Field label="Designation" value={data.designation} />
          <Field label="Date of Joining" value={fmtDate(data.dateOfJoining)} />
          <Field label="Employment Type" value={data.employmentType} />
          <Field label="Manager" value={data.manager?.fullName} />
          <Field label="Role" value={data.role?.name} />
        </dl>
      </Section>

      <Section title="Contact Information">
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

      <Section title="Banking Information">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Bank Name" value={data.banking?.bankName} />
          <Field label="Account Holder Name" value={data.banking?.accountHolderName} />
          <Field label="Account Number" value={data.banking?.accountNumber} />
          <Field label="Bank Branch" value={data.banking?.bankBranch} />
        </dl>
      </Section>

      <Section title="Shift">
        <p className="text-sm text-text">{data.shift?.name || 'No shift assigned'}</p>
        {canEdit && (
          <div className="mt-3 max-w-xs">
            <ShiftAssignControl
              employeeId={data.id}
              currentShiftId={data.shift?.id ?? null}
            />
          </div>
        )}
      </Section>

      <Section title="Documents">
        <EmployeeDocumentsList
          employeeId={data.id}
          documents={data.documents}
          canEdit={canEdit}
        />
      </Section>
    </div>
  )
}

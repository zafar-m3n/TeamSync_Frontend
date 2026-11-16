import { z } from 'zod'
import { EMPLOYMENT_STATUSES, isLeaving } from '@/pages/employees/utils/employmentStatus'

export const EMPLOYMENT_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Intern'].map((t) => ({
  value: t,
  label: t,
}))
export const STATUS_OPTIONS = EMPLOYMENT_STATUSES.map((s) => ({ value: s, label: s }))
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
]

// Single source of truth for the wizard length. Every "is this the last step"
// and "how many steps" decision derives from this — nothing hardcoded elsewhere.
export const TOTAL_STEPS = 4
export const ALL_STEPS = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1)

export const STEP_LABELS = {
  1: 'Account & Basic Information',
  2: 'Employment Details',
  3: 'Contact Information',
  4: 'Banking Information',
}

const optionalStr = z.string().trim().optional()

const contactSchema = z.object({
  addressLine1: optionalStr,
  addressLine2: optionalStr,
  state: optionalStr,
  country: optionalStr,
  postalCode: optionalStr,
  emergencyContactName: optionalStr,
  emergencyContactRelationship: optionalStr,
  emergencyContactPhone: optionalStr,
})

const bankingSchema = z.object({
  bankName: optionalStr,
  accountHolderName: optionalStr,
  accountNumber: optionalStr,
  bankBranch: optionalStr,
})

const CONTACT_KEYS = Object.keys(contactSchema.shape)
const BANKING_KEYS = Object.keys(bankingSchema.shape)

export function buildSchema(mode) {
  return z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    ...(mode === 'create'
      ? { initialPassword: z.string().min(8, 'At least 8 characters') }
      : {}),
    roleId: z
      .number({ message: 'Role is required' })
      .int()
      .positive('Role is required'),
    fullName: z.string().trim().min(1, 'Full name is required'),
    employeeCode: z.string().trim().min(1, 'Employee code is required'),
    dob: optionalStr,
    gender: optionalStr,
    phone: optionalStr,
    departmentId: z.number().int().positive().nullable().optional(),
    designation: optionalStr,
    dateOfJoining: optionalStr,
    employmentType: optionalStr,
    employmentStatus: z.enum(EMPLOYMENT_STATUSES),
    terminationDate: optionalStr,
    managerId: z.number().int().positive().nullable().optional(),
    contact: contactSchema,
    banking: bankingSchema,
  }).superRefine((v, ctx) => {
    if (!isLeaving(v.employmentStatus)) return
    if (!v.terminationDate) {
      ctx.addIssue({ code: 'custom', path: ['terminationDate'], message: `Required when ${v.employmentStatus}` })
    } else if (v.dateOfJoining && v.terminationDate < v.dateOfJoining) {
      ctx.addIssue({ code: 'custom', path: ['terminationDate'], message: 'Cannot be before the date of joining' })
    }
  })
}

export function stepFields(mode) {
  return {
    1:
      mode === 'create'
        ? ['email', 'initialPassword', 'roleId', 'fullName', 'employeeCode', 'dob', 'gender', 'phone']
        : ['email', 'roleId', 'fullName', 'employeeCode', 'dob', 'gender', 'phone'],
    2: ['departmentId', 'designation', 'dateOfJoining', 'employmentType', 'employmentStatus', 'terminationDate', 'managerId'],
    3: CONTACT_KEYS.map((k) => `contact.${k}`),
    4: BANKING_KEYS.map((k) => `banking.${k}`),
  }
}

const emptyFields = (keys) => Object.fromEntries(keys.map((key) => [key, '']))

export function emptyFormValues(mode) {
  return {
    email: '',
    ...(mode === 'create' ? { initialPassword: '' } : {}),
    roleId: undefined,
    fullName: '',
    employeeCode: '',
    dob: '',
    gender: '',
    phone: '',
    departmentId: null,
    designation: '',
    dateOfJoining: '',
    employmentType: '',
    employmentStatus: 'Active',
    terminationDate: '',
    managerId: null,
    contact: emptyFields(CONTACT_KEYS),
    banking: emptyFields(BANKING_KEYS),
  }
}

// NULL columns load as '' so the string fields validate.
const toFormFields = (keys, row) =>
  Object.fromEntries(keys.map((key) => [key, row?.[key] ?? '']))

export function toFormValues(emp) {
  return {
    email: emp.email ?? '',
    roleId: emp.role?.id ?? emp.roleId ?? undefined,
    fullName: emp.fullName ?? '',
    employeeCode: emp.employeeCode ?? '',
    dob: (emp.dob ?? '').slice(0, 10),
    gender: emp.gender ?? '',
    phone: emp.phone ?? '',
    departmentId: emp.department?.id ?? emp.departmentId ?? null,
    designation: emp.designation ?? '',
    dateOfJoining: (emp.dateOfJoining ?? '').slice(0, 10),
    employmentType: emp.employmentType ?? '',
    employmentStatus: emp.employmentStatus ?? 'Active',
    terminationDate: (emp.terminationDate ?? '').slice(0, 10),
    managerId: emp.manager?.id ?? emp.managerId ?? null,
    contact: toFormFields(CONTACT_KEYS, emp.contact),
    banking: toFormFields(BANKING_KEYS, emp.banking),
  }
}

const isEmpty = (value) => value === '' || value === null || value === undefined

function cleanObject(obj) {
  const out = {}
  for (const [key, value] of Object.entries(obj)) {
    if (isEmpty(value)) continue
    out[key] = value
  }
  return out
}

// employmentType is required by the backend, so it can be changed but not cleared.
const CLEARABLE_FIELDS = ['dob', 'gender', 'phone', 'departmentId', 'designation', 'dateOfJoining', 'managerId']

// On edit, a field the user emptied is sent as null so the backend clears it.
function clearedFields(values, dirty, keys) {
  const out = {}
  for (const key of keys) {
    if (dirty?.[key] && isEmpty(values[key])) out[key] = null
  }
  return out
}

export function buildPayload(values, { mode, dirtyFields }) {
  const payload = cleanObject({
    email: values.email,
    ...(mode === 'create' ? { initialPassword: values.initialPassword } : {}),
    roleId: values.roleId,
    fullName: values.fullName,
    employeeCode: values.employeeCode,
    dob: values.dob,
    gender: values.gender,
    phone: values.phone,
    departmentId: values.departmentId ?? undefined,
    designation: values.designation,
    dateOfJoining: values.dateOfJoining,
    employmentType: values.employmentType,
    employmentStatus: values.employmentStatus,
    managerId: values.managerId ?? undefined,
  })
  // Always explicit: null tells the backend a non-leaving status has no date.
  payload.terminationDate = isLeaving(values.employmentStatus) ? values.terminationDate : null
  const contact = cleanObject(values.contact)
  const banking = cleanObject(values.banking)
  if (mode === 'edit') {
    Object.assign(payload, clearedFields(values, dirtyFields, CLEARABLE_FIELDS))
    Object.assign(contact, clearedFields(values.contact, dirtyFields.contact, CONTACT_KEYS))
    Object.assign(banking, clearedFields(values.banking, dirtyFields.banking, BANKING_KEYS))
  }
  if (Object.keys(contact).length) payload.contact = contact
  if (Object.keys(banking).length) payload.banking = banking
  return payload
}

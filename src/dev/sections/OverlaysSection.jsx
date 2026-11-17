import { useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Drawer from '@/components/ui/Drawer'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Tabs, { TabPanel } from '@/components/ui/Tabs'
import Select from '@/components/ui/Select'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import { DateField } from '@/components/form/DatePicker'
import { toast } from '@/hooks/useToast'

const OPTIONS = [
  { value: 'annual', label: 'Annual leave' },
  { value: 'sick', label: 'Sick leave' },
]

const TABS = [
  { key: 'requests', label: 'Requests', count: 4 },
  { key: 'types', label: 'Leave types' },
  { key: 'balances', label: 'Balances' },
]

function Card({ title, children }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-fg-muted">{title}</h3>
      {children}
    </div>
  )
}

export default function OverlaysSection() {
  const [modal, setModal] = useState(false)
  const [nested, setNested] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [drawer, setDrawer] = useState(null)
  const [tab, setTab] = useState('requests')
  const [date, setDate] = useState('')

  const fakeConfirm = () => {
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      setConfirm(false)
      toast.success('Document deleted (demo, nothing was changed).')
    }, 900)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Modal, ConfirmDialog, Drawer (keyboard: Tab / Shift+Tab / Esc)">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setModal(true)}>Open form modal</Button>
          <Button variant="danger" onClick={() => setConfirm(true)}>
            Open confirm dialog
          </Button>
          <Button variant="secondary" onClick={() => setDrawer('right')}>
            Open drawer (right)
          </Button>
          <Button variant="secondary" onClick={() => setDrawer('left')}>
            Open drawer (left, nav style)
          </Button>
        </div>
      </Card>

      <Card title="Toasts (Zustand store)">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => toast.success('Leave request saved.')}>
            Success
          </Button>
          <Button variant="secondary" onClick={() => toast.error('Could not reach the server. Try again.')}>
            Error
          </Button>
          <Button variant="secondary" onClick={() => toast.warning('Your session expires in 5 minutes.')}>
            Warning
          </Button>
          <Button variant="secondary" onClick={() => toast.info('Holidays for 2027 are now available.')}>
            Info
          </Button>
        </div>
      </Card>

      <Card title="Tabs (Left/Right/Home/End) with TabPanel">
        <Tabs id="gallery-tabs" tabs={TABS} activeKey={tab} onChange={setTab} />
        <TabPanel id="gallery-tabs" activeKey={tab} className="pt-4 text-sm text-fg-muted">
          Showing the “{TABS.find((t) => t.key === tab)?.label}” panel.
        </TabPanel>
      </Card>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Request leave"
        description="Focus lands on the first field, not Close."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setNested(true)}>
              Open nested confirm
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Leave type" required>
            <Select options={OPTIONS} placeholder="Select a type" />
          </FormField>
          <FormField label="Start date" required>
            <DateField value={date} onChange={setDate} />
          </FormField>
          <FormField label="Reason" hint="Esc inside an open select or calendar closes only that popup.">
            <Input multiline rows={3} />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={nested}
        onClose={() => setNested(false)}
        onConfirm={() => setNested(false)}
        title="Discard this request?"
        message="Esc here closes only this dialog; the form underneath stays open."
        confirmLabel="Discard"
      />

      <ConfirmDialog
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={fakeConfirm}
        isLoading={busy}
        title="Delete document?"
        message="“passport-scan.pdf” will be removed from this employee's documents. This can't be undone."
        confirmLabel="Delete"
      />

      <Drawer
        isOpen={drawer !== null}
        onClose={() => setDrawer(null)}
        side={drawer ?? 'right'}
        size={drawer === 'left' ? 'sm' : 'md'}
        title={drawer === 'left' ? 'Navigation' : 'Employee details'}
        description="Same focus and Escape handling as the modal."
        footer={
          <Button variant="secondary" onClick={() => setDrawer(null)}>
            Close
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Search">
            <Input placeholder="Type to filter…" />
          </FormField>
          <p className="text-fg-muted">Drawer body scrolls independently; the page behind is locked and inert.</p>
        </div>
      </Drawer>
    </div>
  )
}

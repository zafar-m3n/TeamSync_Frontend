import { useState } from 'react'
import Tabs, { TabPanel } from '@/components/ui/Tabs'
import DepartmentsTab from '@/pages/departments-shifts/components/DepartmentsTab'
import ShiftsTab from '@/pages/departments-shifts/components/ShiftsTab'

const TABS = [
  { key: 'departments', label: 'Departments' },
  { key: 'shifts', label: 'Shifts' },
]

export default function DepartmentsShiftsPage() {
  const [activeKey, setActiveKey] = useState('departments')

  return (
    <div className="space-y-5">
      <Tabs id="departments-shifts" tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      <TabPanel id="departments-shifts" activeKey={activeKey}>
        {activeKey === 'departments' ? <DepartmentsTab /> : <ShiftsTab />}
      </TabPanel>
    </div>
  )
}

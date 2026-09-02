import { useState } from 'react'
import Tabs from '../../components/ui/Tabs'
import DepartmentsTab from './components/DepartmentsTab'
import ShiftsTab from './components/ShiftsTab'

const TABS = [
  { key: 'departments', label: 'Departments' },
  { key: 'shifts', label: 'Shifts' },
]

export default function DepartmentsShiftsPage() {
  const [activeKey, setActiveKey] = useState('departments')

  return (
    <div className="space-y-6">
      <Tabs tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      {activeKey === 'departments' ? <DepartmentsTab /> : <ShiftsTab />}
    </div>
  )
}

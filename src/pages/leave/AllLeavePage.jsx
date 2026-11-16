import { useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import LeaveRequestsTab from '@/pages/leave/components/LeaveRequestsTab'
import LeaveTypesTab from '@/pages/leave/components/LeaveTypesTab'

const TABS = [
  { key: 'requests', label: 'Requests' },
  { key: 'types', label: 'Leave Types' },
]

export default function AllLeavePage() {
  const [activeKey, setActiveKey] = useState('requests')

  return (
    <div className="space-y-6">
      <Tabs tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      {activeKey === 'requests' ? <LeaveRequestsTab /> : <LeaveTypesTab />}
    </div>
  )
}

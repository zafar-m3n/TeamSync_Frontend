import { useState } from 'react'
import Tabs, { TabPanel } from '@/components/ui/Tabs'
import LeaveRequestsTab from '@/pages/leave/components/LeaveRequestsTab'
import LeaveTypesTab from '@/pages/leave/components/LeaveTypesTab'

const TABS = [
  { key: 'requests', label: 'Requests' },
  { key: 'types', label: 'Leave Types' },
]

export default function AllLeavePage() {
  const [activeKey, setActiveKey] = useState('requests')

  return (
    <div className="space-y-5">
      <Tabs id="all-leave" tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      <TabPanel id="all-leave" activeKey={activeKey}>
        {activeKey === 'requests' ? <LeaveRequestsTab /> : <LeaveTypesTab />}
      </TabPanel>
    </div>
  )
}

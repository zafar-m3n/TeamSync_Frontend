import { useState } from 'react'
import Tabs, { TabPanel } from '@/components/ui/Tabs'
import RolesTab from '@/pages/roles-permissions/components/RolesTab'
import PermissionsTab from '@/pages/roles-permissions/components/PermissionsTab'

const TABS = [
  { key: 'roles', label: 'Roles' },
  { key: 'permissions', label: 'Permissions' },
]

export default function RolesPermissionsPage() {
  const [activeKey, setActiveKey] = useState('roles')

  return (
    <div className="space-y-5">
      <Tabs id="roles-permissions" tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      <TabPanel id="roles-permissions" activeKey={activeKey}>
        {activeKey === 'roles' ? <RolesTab /> : <PermissionsTab />}
      </TabPanel>
    </div>
  )
}

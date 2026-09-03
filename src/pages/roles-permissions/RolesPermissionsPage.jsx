import { useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import RolesTab from '@/pages/roles-permissions/components/RolesTab'
import PermissionsTab from '@/pages/roles-permissions/components/PermissionsTab'

const TABS = [
  { key: 'roles', label: 'Roles' },
  { key: 'permissions', label: 'Permissions' },
]

export default function RolesPermissionsPage() {
  const [activeKey, setActiveKey] = useState('roles')

  return (
    <div className="space-y-6">
      <Tabs tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      {activeKey === 'roles' ? <RolesTab /> : <PermissionsTab />}
    </div>
  )
}

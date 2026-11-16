import { useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import DocumentsTab from '@/pages/training/components/DocumentsTab'
import AssignmentsTab from '@/pages/training/components/AssignmentsTab'
import TrainingCategoriesTab from '@/pages/training/components/TrainingCategoriesTab'

const TABS = [
  { key: 'documents', label: 'Documents' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'categories', label: 'Categories' },
]

export default function TrainingPage() {
  const [activeKey, setActiveKey] = useState('documents')

  return (
    <div className="space-y-6">
      <Tabs tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
      {activeKey === 'documents' && <DocumentsTab />}
      {activeKey === 'assignments' && <AssignmentsTab />}
      {activeKey === 'categories' && <TrainingCategoriesTab />}
    </div>
  )
}

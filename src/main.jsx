import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import '@/styles/index.css'
import '@/lib/theme'
import '@/lib/icons'
import { queryClient } from '@/lib/queryClient.js'
import { Toaster } from '@/components/ui/Toast.jsx'
import { AuthProvider } from '@/store/AuthContext.jsx'
import router from '@/lib/router.jsx'
import { CONFIG_ERROR } from '@/lib/config'

const root = createRoot(document.getElementById('root'))

if (CONFIG_ERROR) {
  if (import.meta.env.DEV) {
    root.render(
      <div role="alert" className="p-6 font-mono text-sm text-danger">
        <strong>Configuration error</strong>
        <p>{CONFIG_ERROR}</p>
      </div>,
    )
  }
  throw new Error(CONFIG_ERROR)
}

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
)

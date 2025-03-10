import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthProvider from './components/AuthProvider.tsx'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router.tsx'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)

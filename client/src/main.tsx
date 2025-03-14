import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AuthProvider from './components/AuthProvider.tsx'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router.tsx'
import { ThemeProvider } from "./components/ThemeProvider"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

<>
  {/* ... */}
  <ToastContainer position="top-right" autoClose={3000} />
</>

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ThemeProvider>
         <AuthProvider>
          <RouterProvider router={router} />
          <ToastContainer position="top-right" autoClose={4000} theme="colored" />
         </AuthProvider>
      </ThemeProvider>
  </StrictMode>,
)

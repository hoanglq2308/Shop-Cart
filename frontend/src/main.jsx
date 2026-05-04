import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/ToastProvider'
import { LoadingProvider } from './components/LoadingProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </ToastProvider>
  </StrictMode>,
)

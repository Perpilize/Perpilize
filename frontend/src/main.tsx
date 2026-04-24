import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PerpilizeProvider } from './lib/Provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PerpilizeProvider>
      <App />
    </PerpilizeProvider>
  </StrictMode>,
)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* :promoCode is optional — "/" renders the same page without a code */}
        <Route path="/:promoCode?" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

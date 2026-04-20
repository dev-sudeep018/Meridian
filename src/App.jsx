import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import AppPage from './pages/AppPage.jsx'
import DiscoveryPage from './pages/DiscoveryPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/discovery/:id" element={<DiscoveryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

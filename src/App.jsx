import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ArkadePage from './pages/ArkadePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/arkade" element={<ArkadePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

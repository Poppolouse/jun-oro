import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import Arkade from '@/pages/Arkade'
import ComingSoon from '@/pages/ComingSoon'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-page text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/arkade" element={<Arkade />} />
          <Route path="/sinepedi" element={<ComingSoon />} />
          <Route path="/sayfa" element={<ComingSoon />} />
          <Route path="/kas-kurdu" element={<ComingSoon />} />
          <Route path="/finans" element={<ComingSoon />} />
          <Route path="/yapyap" element={<ComingSoon />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
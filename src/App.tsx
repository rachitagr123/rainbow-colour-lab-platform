import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import Layout from './components/Layout'
import { isVibrantLayoutPreview } from './config/layoutPreview'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import GalleryPage from './pages/GalleryPage'
import HomePage from './pages/HomePage'
import HomePageVibrant from './pages/HomePageVibrant'
import IndustrialPage from './pages/IndustrialPage'
import ServicesPage from './pages/ServicesPage'
import './App.css'
import './vibrant-preview.css'

function HomeRoute() {
  const [searchParams] = useSearchParams()
  return isVibrantLayoutPreview(searchParams) ? <HomePageVibrant /> : <HomePage />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeRoute />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="industrial" element={<IndustrialPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

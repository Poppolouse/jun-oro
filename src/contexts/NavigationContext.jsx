import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const NavigationContext = createContext()

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

export const NavigationProvider = ({ children }) => {
  const [navigationHistory, setNavigationHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(null)
  const location = useLocation()

  // Sayfa bilgileri
  const pageInfo = {
    '/': { title: 'Ana Sayfa', icon: '🏠' },
    '/arkade': { title: 'Arkade Dashboard', icon: '🎮' },
    '/arkade/library': { title: 'Kütüphane', icon: '📚' },
    '/arkade/session': { title: 'Aktif Oturum', icon: '🎮' },
    '/gallery': { title: 'Galeri', icon: '🖼️' },
    '/backlog': { title: 'Backlog', icon: '📋' },
    '/wishlist': { title: 'İstek Listesi', icon: '⭐' },
    '/stats': { title: 'İstatistikler', icon: '📈' },
    '/settings': { title: 'Ayarlar', icon: '⚙️' }
  }

  useEffect(() => {
    const currentPath = location.pathname
    const current = pageInfo[currentPath] || { title: 'Bilinmeyen Sayfa', icon: '❓' }
    
    // Eğer bu sayfa zaten geçmişte varsa, onu çıkar
    const filteredHistory = navigationHistory.filter(page => page.path !== currentPath)
    
    // Mevcut sayfayı geçmişe ekle (en son 5 sayfa)
    if (currentPage && currentPage.path !== currentPath) {
      setNavigationHistory([currentPage, ...filteredHistory].slice(0, 5))
    }
    
    setCurrentPage({ ...current, path: currentPath })
  }, [location.pathname])

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const lastPage = navigationHistory[0]
      window.history.pushState(null, '', lastPage.path)
      window.location.href = lastPage.path
    } else {
      // Eğer geçmiş yoksa ana sayfaya git
      window.location.href = '/'
    }
  }

  const getLastVisitedPage = () => {
    return navigationHistory.length > 0 ? navigationHistory[0] : null
  }

  const value = {
    currentPage,
    navigationHistory,
    goBack,
    getLastVisitedPage,
    pageInfo
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export default NavigationContext
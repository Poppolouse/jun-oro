import { createContext, useContext, useState, useEffect } from 'react'
import { userService } from '../data/users'

// API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
  useEffect(() => {
    const savedUser = localStorage.getItem('arkade_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        // Backend'den güncel kullanıcı verilerini çek
        setTimeout(async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/users/${parsedUser.id}`)
            const data = await response.json()
            if (response.ok && data.success) {
              const updatedUser = data.data
              setUser(updatedUser)
              localStorage.setItem('arkade_user', JSON.stringify(updatedUser))
            }
          } catch (error) {
            console.error('Error refreshing user data on startup:', error)
          }
        }, 100)
      } catch (error) {
        console.error('Kullanıcı bilgileri parse edilemedi:', error)
        localStorage.removeItem('arkade_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const result = await userService.login(username, password)
      
      if (result.success) {
        setUser(result.user)
        localStorage.setItem('arkade_user', JSON.stringify(result.user))
        // Login sonrası kullanıcıyı backend'den tazele (profil görselleri vb.)
        try {
          await refreshUser()
        } catch {}
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      return { success: false, message: 'Giriş sırasında bir hata oluştu' }
    }
  }

  const register = async (userData) => {
    try {
      const result = await userService.register(userData)
      
      if (result.success) {
        // Admin onayı sistemi - kullanıcıyı otomatik login yapmıyoruz
        // setUser(result.user)
        // localStorage.setItem('arkade_user', JSON.stringify(result.user))
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      return { success: false, message: 'Kayıt sırasında bir hata oluştu' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('arkade_user')
  }

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    localStorage.setItem('arkade_user', JSON.stringify(updatedUser))
  }

  const refreshUser = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`)
      const data = await response.json()

      if (response.ok && data.success) {
        const updatedUser = data.data
        setUser(updatedUser)
        localStorage.setItem('arkade_user', JSON.stringify(updatedUser))
        return { success: true, user: updatedUser }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
    return { success: false }
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const isAuthenticated = () => {
    return !!user
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isAdmin,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
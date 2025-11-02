import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../contexts/AuthContext'
import { useHeaderComponent } from '../hooks/useHeaderComponent'
import { userService } from '../data/users'
import igdbApi from '../services/igdbApi'
import steamApi from '../services/steamApi'
import { apiKeyService } from '../services/apiKeys'
import uploadService from '../services/uploadService'
import SiteFooter from '../components/SiteFooter'
import ElementSelector from '../components/Tutorial/ElementSelector'
import UpdatesAdmin from '../components/Updates/UpdatesAdmin'
import TutorialAdmin from '../components/Tutorial/TutorialAdmin'
import ImageUpload from '../components/FileUpload/ImageUpload'

function SettingsPage() {
  const { user, isAdmin, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  
  // Hangi header'ın kullanılacağını belirle
  const HeaderComponent = useHeaderComponent()
  const [users, setUsers] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)

  // Kullanıcı listesini backend'den çek
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        const data = await response.json();
        if (data.success) {
          // Aktif kullanıcıları ve pending kullanıcıları ayır
          const activeUsers = data.data.filter(user => user.status !== 'pending');
          const pendingUsersList = data.data.filter(user => user.status === 'pending');
          setUsers(activeUsers);
          setPendingUsers(pendingUsersList);
        } else {
          console.error('Kullanıcı listesi alınamadı:', data.message);
          // Fallback olarak local data kullan
          if (isAdmin()) {
            setUsers(userService.getAllUsersWithPasswords());
          } else {
            setUsers(userService.getAllUsers());
          }
        }
      } catch (error) {
        console.error('Kullanıcı listesi çekme hatası:', error);
        // Fallback olarak local data kullan
        if (isAdmin()) {
          setUsers(userService.getAllUsersWithPasswords());
        } else {
          setUsers(userService.getAllUsers());
        }
      }
    };

    fetchUsers();
  }, []);
  
  // IGDB API state'leri
  const [igdbClientId, setIgdbClientId] = useState('')
  const [igdbAccessToken, setIgdbAccessToken] = useState('')
  const [apiStats, setApiStats] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  // Steam API state'leri
  const [steamApiKey, setSteamApiKey] = useState('')
  const [steamConnectionStatus, setSteamConnectionStatus] = useState(null)
  const [isTestingSteamConnection, setIsTestingSteamConnection] = useState(false)

  // Supabase API state'leri
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')
  const [supabaseConnectionStatus, setSupabaseConnectionStatus] = useState(null)
  const [isTestingSupabaseConnection, setIsTestingSupabaseConnection] = useState(false)

  // API Key Management state'leri
  const [apiKeys, setApiKeys] = useState([])
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [editingApiKey, setEditingApiKey] = useState(null)
  const [newApiKey, setNewApiKey] = useState({
    serviceName: '',
    keyName: '',
    keyValue: '',
    isGlobal: true,
    metadata: {}
  })
  const [apiKeyOperationStatus, setApiKeyOperationStatus] = useState(null)

  // Bildirim yönetimi state'leri
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('info')
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [notificationHistory, setNotificationHistory] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])

  // R2 Depolama state'leri
  const [r2Stats, setR2Stats] = useState(null)
  const [r2ConnectionStatus, setR2ConnectionStatus] = useState(null)
  const [isLoadingR2Stats, setIsLoadingR2Stats] = useState(false)
  const [isTestingR2Connection, setIsTestingR2Connection] = useState(false)
  const [sendToAll, setSendToAll] = useState(true)

  // Bildirim takip sistemi state'leri
  const [notificationStats, setNotificationStats] = useState({})
  const [userReadStats, setUserReadStats] = useState({})
  const [selectedNotificationId, setSelectedNotificationId] = useState(null)

  // Trafik logları state'leri
  const [trafficLogs, setTrafficLogs] = useState([])
  const [trafficFilter, setTrafficFilter] = useState('all')
  const [trafficDateRange, setTrafficDateRange] = useState('today')

  // Admin denetim günlüğü state'leri
  const [auditLogs, setAuditLogs] = useState([])

  // Şifre gösterme state'i
  const [showPasswords, setShowPasswords] = useState({})

  // Admin sidebar expand/collapse state'i
  const [isAdminSidebarExpanded, setIsAdminSidebarExpanded] = useState(true)
  
  // Admin kategorileri expand/collapse state'i
  const [expandedCategories, setExpandedCategories] = useState({
    management: true,
    analytics: true,
    integrations: true
  })
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false)
  const [auditLogsPage, setAuditLogsPage] = useState(1)
  const [auditLogsPagination, setAuditLogsPagination] = useState({})
  const [auditLogsFilter, setAuditLogsFilter] = useState('all')

  // Profil resmi state'leri
  const [profileImage, setProfileImage] = useState(user?.profileImage || null)
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState(null)
  const [isProfileImageExpanded, setIsProfileImageExpanded] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Expandable liste state'leri
  const [expandedUserDetails, setExpandedUserDetails] = useState({})

  // Changelog yönetimi state'leri
  const [changelogs, setChangelogs] = useState([])
  const [isLoadingChangelogs, setIsLoadingChangelogs] = useState(false)
  const [showChangelogModal, setShowChangelogModal] = useState(false)
  const [editingChangelog, setEditingChangelog] = useState(null)
  const [newChangelog, setNewChangelog] = useState({
    title: '',
    content: '',
    version: '',
    type: 'update',
    isPublished: true, // Default olarak yayınlanmış
    releaseDate: new Date().toISOString().split('T')[0] // Today's date as default
  })
  const [changelogOperationStatus, setChangelogOperationStatus] = useState(null)

  const tabs = [
    { id: 'profile', name: 'Profil', icon: '👤' },
    { id: 'preferences', name: 'Tercihler', icon: '⚙️' },
    { id: 'notifications', name: 'Bildirimler', icon: '🔔' },
    { id: 'privacy', name: 'Gizlilik', icon: '🔒' },
    ...(isAdmin() ? [
      { id: 'admin', name: 'Admin Panel', icon: '👑' }
    ] : [])
  ]

  // Admin sol sidebar kategorileri ve alt öğeleri
  const adminNavGroups = [
    {
      id: 'management',
      name: 'Yönetim',
      icon: '🛠️',
      items: [
        { id: 'users', name: 'Kullanıcı Yönetimi', icon: '👥' },
        { id: 'notifications', name: 'Bildirim Yönetimi', icon: '📢' },
        { id: 'tracking', name: 'Bildirim Takip', icon: '📊' },
        { id: 'tutorials', name: 'Tutorial Yönetimi', icon: '❓' },
        { id: 'changelog', name: 'Changelog Yönetimi', icon: '📋' }
      ]
    },
    {
      id: 'analytics',
      name: 'Analitik & Loglar',
      icon: '📈',
      items: [
        { id: 'traffic', name: 'Trafik Logları', icon: '🚦' },
        { id: 'api-logs', name: 'API Logları', icon: '🧾' },
        { id: 'audit-logs', name: 'Admin Denetim Günlüğü', icon: '🛡️' }
      ]
    },
    {
      id: 'integrations',
      name: 'Entegrasyonlar',
      icon: '🔌',
      items: [
        { id: 'api-keys', name: 'API Anahtar Yönetimi', icon: '🔑' },
        { id: 'api', name: 'API Merkezi', icon: '🔌' },
        { id: 'r2-storage', name: 'R2 Depolama Yönetimi', icon: '☁️' },
        { id: 'updates', name: 'Güncel Geliştirmeler', icon: '🆕' }
      ]
    }
  ]

  const [adminActiveTab, setAdminActiveTab] = useState('users')

  // API verilerini yükle
  useEffect(() => {
    const loadApiData = async () => {
      if (isAdmin()) {
        try {
          // IGDB API anahtarlarını database'den yükle
          try {
            const igdbCredentials = await apiKeyService.getIgdbCredentials()
            if (igdbCredentials) {
              setIgdbClientId(igdbCredentials.clientId || '')
              setIgdbAccessToken(igdbCredentials.accessToken || '')
            } else {
              setIgdbClientId('')
              setIgdbAccessToken('')
            }
          } catch (error) {
            console.warn('IGDB credentials not found in database:', error)
            setIgdbClientId('')
            setIgdbAccessToken('')
          }
          
          // Steam API anahtarını database'den yükle
          try {
            const steamApiKey = await apiKeyService.getSteamApiKey(user.id)
            setSteamApiKey(steamApiKey || '')
          } catch (error) {
            console.warn('Steam API key not found in database:', error)
            setSteamApiKey('')
          }
          
          // IGDB API anahtarlarını database'den yükle
          try {
            const igdbCredentials = await apiKeyService.getIgdbCredentials(user.id)
            if (igdbCredentials) {
              setIgdbClientId(igdbCredentials.clientId || '')
              setIgdbAccessToken(igdbCredentials.accessToken || '')
            }
          } catch (error) {
            console.warn('IGDB credentials not found in database:', error)
            setIgdbClientId('')
            setIgdbAccessToken('')
          }
          
          // Supabase API anahtarlarını database'den yükle
          try {
            const supabaseUrlKey = await apiKeyService.getServiceApiKey('supabase_url', user.id, true)
            const supabaseAnonKeyKey = await apiKeyService.getServiceApiKey('supabase_anon', user.id, true)
            
            setSupabaseUrl(supabaseUrlKey?.data?.keyValue || '')
            setSupabaseAnonKey(supabaseAnonKeyKey?.data?.keyValue || '')
          } catch (error) {
            console.warn('Supabase credentials not found in database:', error)
            setSupabaseUrl('')
            setSupabaseAnonKey('')
          }
          
          // API istatistiklerini yükle
          setApiStats(igdbApi.getApiStats())
        } catch (error) {
          console.error('Failed to load API credentials:', error)
        }
      }
    }

    loadApiData()
    
    // Bildirim takip verilerini yükle
    if (isAdmin() && adminActiveTab === 'tracking') {
      loadNotificationStats()
    }
    
    // Trafik loglarını yükle
    if (isAdmin() && adminActiveTab === 'traffic') {
      loadTrafficLogs()
    }
    
    // API anahtarlarını yükle
    if (isAdmin() && adminActiveTab === 'api-keys') {
      loadApiKeys()
    }
    
    // Changelog'ları yükle
    if (isAdmin() && adminActiveTab === 'changelog') {
      loadChangelogs()
    }
    
    // Admin denetim günlüklerini yükle
    if (isAdmin() && adminActiveTab === 'audit-logs') {
      loadAuditLogs()
    }
  }, [adminActiveTab, isAdmin])

  // Bildirim geçmişini yükle
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('notificationHistory') || '[]')
      setNotificationHistory(history)
    } catch (error) {
      console.error('Bildirim geçmişi yüklenirken hata:', error)
    }
  }, [])

  const handleDeleteUser = async (userId) => {
    // Önce kullanıcı bilgilerini kontrol et
    const userToDelete = users.find(user => user.id === userId)
    
    // Admin koruma sistemi - Frontend kontrolü
    if (userToDelete && userToDelete.role === 'admin') {
      alert('⚠️ ADMIN KORUMA SİSTEMİ\n\nAdmin hesapları güvenlik nedeniyle silinemez!\n\nBu koruma sistemi yanlışlıkla admin hesabı silinmesini önler.')
      return
    }

    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          // Kullanıcı listesini yenile
          const usersResponse = await fetch('http://localhost:5000/api/users');
          const usersData = await usersResponse.json();
          if (usersData.success) {
            setUsers(usersData.data);
          }
          alert('Kullanıcı başarıyla silindi');
        } else {
          // Backend'den gelen admin koruma mesajını göster
          if (result.error && result.error.includes('Admin hesapları silinemez')) {
            alert('🛡️ ADMIN KORUMA SİSTEMİ\n\n' + result.error);
          } else {
            alert(result.message || 'Kullanıcı silinirken hata oluştu');
          }
        }
      } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
        alert('Kullanıcı silinirken beklenmeyen bir hata oluştu');
      }
    }
  }

  const handleEditUser = (user) => {
    // Backend'den gelen veriyi frontend modalının beklediği formata dönüştür
    const editableUser = {
      id: user.id,
      username: user.username || '',
      email: user.email || '',
      password: '', // Düzenleme sırasında şifre boş başlar
      role: user.role || 'user',
      status: user.status || 'offline',
      avatar: user.profileImage || '',
      profile: {
        firstName: user.name ? user.name.split(' ')[0] : '',
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
        bio: user.bio || '',
        profileImage: user.profileImage || null
      },
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
      lastLogin: user.lastActive ? new Date(user.lastActive).toLocaleDateString('tr-TR') : 'Henüz giriş yapmadı'
    }
    setSelectedUser(editableUser)
    setShowUserModal(true)
  }

  const handleAddNewUser = () => {
    // Yeni kullanıcı için boş template oluştur
    const newUserTemplate = {
      id: null, // Yeni kullanıcı olduğunu belirtmek için null
      username: '',
      email: '',
      password: '',
      role: 'user',
      status: 'offline',
      avatar: '',
      profile: {
        firstName: '',
        lastName: '',
        bio: '',
        profileImage: null
      },
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Henüz giriş yapmadı'
    }
    setSelectedUser(newUserTemplate)
    setShowUserModal(true)
  }

  // Pending kullanıcıyı onayla
  const handleApproveUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Pending kullanıcıyı listeden çıkar ve aktif kullanıcılara ekle
        const approvedUser = pendingUsers.find(user => user.id === userId);
        if (approvedUser) {
          approvedUser.status = 'active';
          setPendingUsers(prev => prev.filter(user => user.id !== userId));
          setUsers(prev => [...prev, approvedUser]);
        }
        alert('Kullanıcı başarıyla onaylandı!');
      } else {
        alert('Kullanıcı onaylanırken hata oluştu: ' + (data.message || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Kullanıcı onaylama hatası:', error);
      alert('Kullanıcı onaylanırken hata oluştu');
    }
  };

  // Pending kullanıcıyı reddet
  const handleRejectUser = async (userId) => {
    if (!confirm('Bu kullanıcıyı reddetmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Pending kullanıcıyı listeden çıkar
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        alert('Kullanıcı başarıyla reddedildi!');
      } else {
        alert('Kullanıcı reddedilirken hata oluştu: ' + (data.message || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Kullanıcı reddetme hatası:', error);
      alert('Kullanıcı reddedilirken hata oluştu');
    }
  };

  // Şifre gösterme/gizleme fonksiyonu
  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  // Kategori genişletme/daraltma fonksiyonu
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  // Kullanıcı güvenlik bilgilerini yükle
  const loadUserSecurity = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/security`)
      const data = await response.json()
      
      if (data.success) {
        // Kullanıcı listesini güncelle
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { 
                  ...user, 
                  password: data.data.password,
                  security: data.data.security 
                }
              : user
          )
        )
      }
    } catch (error) {
      console.error('Güvenlik bilgileri yüklenirken hata:', error)
    }
  }

  // Kullanıcının gerçek şifresini getir
  const getUserPassword = (userId) => {
    const fullUser = users.find(u => u.id === userId)
    return fullUser?.password || 'Şifre bulunamadı'
  }

  // IGDB API fonksiyonları
  const handleSaveApiCredentials = async () => {
    if (!igdbClientId.trim() || !igdbAccessToken.trim()) {
      alert('Lütfen tüm alanları doldurun')
      return
    }
    
    try {
      // Database'e kaydet
      await apiKeyService.setIgdbCredentials(igdbClientId.trim(), igdbAccessToken.trim())
      setConnectionStatus({ success: true, message: 'API anahtarları database\'e kaydedildi' })
      
      // İstatistikleri güncelle
      setApiStats(igdbApi.getApiStats())
    } catch (error) {
      console.error('Failed to save IGDB credentials:', error)
      setConnectionStatus({ success: false, message: 'API anahtarları kaydedilemedi: ' + error.message })
    }
  }

  const handleTestConnection = async () => {
    if (!igdbClientId.trim() || !igdbAccessToken.trim()) {
      alert('Lütfen önce API anahtarlarını kaydedin')
      return
    }
    
    setIsTestingConnection(true)
    setConnectionStatus(null)
    
    try {
      const result = await igdbApi.testConnection()
      setConnectionStatus(result)
    } catch (error) {
      setConnectionStatus({ success: false, message: error.message })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleClearCredentials = async () => {
    if (window.confirm('API anahtarlarını silmek istediğinizden emin misiniz?')) {
      try {
        await igdbApi.clearCredentials()
        setIgdbClientId('')
        setIgdbAccessToken('')
        setConnectionStatus(null)
        setApiStats(igdbApi.getApiStats())
      } catch (error) {
        console.error('Failed to clear IGDB credentials:', error)
        alert('API anahtarları silinirken hata oluştu: ' + error.message)
      }
    }
  }

  // Steam API fonksiyonları
  const handleSaveSteamApiKey = async () => {
    if (!steamApiKey.trim()) {
      alert('Lütfen Steam API anahtarını girin')
      return
    }
    
    try {
      // Database'e kaydet
      await apiKeyService.setSteamApiKey(steamApiKey.trim())
      setSteamConnectionStatus({ success: true, message: 'Steam API anahtarı database\'e kaydedildi' })
    } catch (error) {
      console.error('Failed to save Steam API key:', error)
      setSteamConnectionStatus({ success: false, message: 'Steam API anahtarı kaydedilemedi: ' + error.message })
    }
  }

  const handleTestSteamConnection = async () => {
    if (!steamApiKey.trim()) {
      alert('Lütfen önce Steam API anahtarını kaydedin')
      return
    }
    
    setIsTestingSteamConnection(true)
    setSteamConnectionStatus(null)
    
    try {
      const result = await steamApi.testConnection()
      setSteamConnectionStatus(result)
    } catch (error) {
      setSteamConnectionStatus({ success: false, message: error.message })
    } finally {
      setIsTestingSteamConnection(false)
    }
  }

  const handleClearSteamCredentials = async () => {
    if (window.confirm('Steam API anahtarını silmek istediğinizden emin misiniz?')) {
      try {
        await steamApi.clearApiKey()
        setSteamApiKey('')
        setSteamConnectionStatus(null)
      } catch (error) {
        console.error('Failed to clear Steam API key:', error)
        alert('Steam API anahtarı silinirken hata oluştu: ' + error.message)
      }
    }
  }

  // Supabase API fonksiyonları
  const handleSaveSupabaseCredentials = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      alert('Lütfen Supabase URL ve API anahtarını girin')
      return
    }
    
    try {
      // Database'e kaydet
      await apiKeyService.createApiKey({
        serviceName: 'supabase_url',
        keyName: 'Supabase Project URL',
        keyValue: supabaseUrl.trim(),
        description: 'Supabase Project URL',
        isGlobal: true
      })
      
      await apiKeyService.createApiKey({
        serviceName: 'supabase_anon',
        keyName: 'Supabase Anon Public Key',
        keyValue: supabaseAnonKey.trim(),
        description: 'Supabase Anon Public Key',
        isGlobal: true
      })
      
      setSupabaseConnectionStatus({ success: true, message: 'Supabase API anahtarları database\'e kaydedildi' })
    } catch (error) {
      console.error('Failed to save Supabase credentials:', error)
      setSupabaseConnectionStatus({ success: false, message: 'Supabase API anahtarları kaydedilemedi: ' + error.message })
    }
  }

  const handleTestSupabaseConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      alert('Lütfen önce Supabase API anahtarlarını kaydedin')
      return
    }
    
    setIsTestingSupabaseConnection(true)
    setSupabaseConnectionStatus(null)
    
    try {
      // Basit bir test isteği gönder
      const response = await fetch(`${supabaseUrl.trim()}/rest/v1/`, {
        headers: {
          'apikey': supabaseAnonKey.trim(),
          'Authorization': `Bearer ${supabaseAnonKey.trim()}`
        }
      })
      
      if (response.ok) {
        setSupabaseConnectionStatus({ success: true, message: 'Supabase bağlantısı başarılı' })
      } else {
        setSupabaseConnectionStatus({ success: false, message: 'Supabase bağlantısı başarısız' })
      }
    } catch (error) {
      setSupabaseConnectionStatus({ success: false, message: `Bağlantı hatası: ${error.message}` })
    } finally {
      setIsTestingSupabaseConnection(false)
    }
  }

  const handleClearSupabaseCredentials = () => {
    if (window.confirm('Supabase API anahtarlarını silmek istediğinizden emin misiniz?')) {
      localStorage.removeItem('supabase_url')
      localStorage.removeItem('supabase_anon_key')
      setSupabaseUrl('')
      setSupabaseAnonKey('')
      setSupabaseConnectionStatus(null)
    }
  }

  // API Key Management fonksiyonları
  const loadApiKeys = async () => {
    setIsLoadingApiKeys(true)
    try {
      const response = await apiKeyService.getApiKeys()
      setApiKeys(response.data || [])
    } catch (error) {
      console.error('Failed to load API keys:', error)
      setApiKeyOperationStatus({ success: false, message: 'API anahtarları yüklenirken hata oluştu: ' + error.message })
    } finally {
      setIsLoadingApiKeys(false)
    }
  }

  // R2 Depolama fonksiyonları
  const loadR2Stats = async () => {
    setIsLoadingR2Stats(true)
    try {
      const response = await fetch('http://localhost:5000/api/r2/stats')
      const data = await response.json()
      
      if (data.success) {
        setR2Stats(data.data)
      } else {
        console.error('R2 istatistikleri alınamadı:', data.message)
      }
    } catch (error) {
      console.error('R2 istatistikleri yüklenirken hata:', error)
    } finally {
      setIsLoadingR2Stats(false)
    }
  }

  const testR2Connection = async () => {
    setIsTestingR2Connection(true)
    try {
      const response = await fetch('http://localhost:5000/api/r2/test')
      const data = await response.json()
      
      if (data.success) {
        setR2ConnectionStatus({ 
          success: true, 
          message: 'R2 bağlantısı başarılı!',
          data: data.data
        })
      } else {
        setR2ConnectionStatus({ 
          success: false, 
          message: data.message || 'R2 bağlantı testi başarısız'
        })
      }
    } catch (error) {
      console.error('R2 bağlantı testi hatası:', error)
      setR2ConnectionStatus({ 
        success: false, 
        message: 'R2 bağlantı testi sırasında hata oluştu: ' + error.message
      })
    } finally {
      setIsTestingR2Connection(false)
    }
  }

  // R2 verilerini sayfa yüklendiğinde çek
  useEffect(() => {
    if (activeTab === 'admin') {
      loadR2Stats()
    }
  }, [activeTab])

  const handleSaveApiKey = async () => {
    if (!newApiKey.serviceName.trim() || !newApiKey.keyName.trim() || !newApiKey.keyValue.trim()) {
      alert('Servis adı, anahtar adı ve değer alanları zorunludur!')
      return
    }

    try {
      if (editingApiKey) {
        await apiKeyService.updateKey(editingApiKey.id, {
          serviceName: newApiKey.serviceName,
          keyName: newApiKey.keyName,
          keyValue: newApiKey.keyValue,
          isGlobal: newApiKey.isGlobal,
          metadata: newApiKey.metadata
        })
        setApiKeyOperationStatus({ success: true, message: 'API anahtarı başarıyla güncellendi!' })
      } else {
        await apiKeyService.saveKey(
          newApiKey.serviceName,
          newApiKey.keyName,
          newApiKey.keyValue,
          newApiKey.isGlobal,
          newApiKey.metadata
        )
        setApiKeyOperationStatus({ success: true, message: 'API anahtarı başarıyla kaydedildi!' })
      }
      
      // Modal'ı kapat ve formu temizle
      setShowApiKeyModal(false)
      setEditingApiKey(null)
      setNewApiKey({
        serviceName: '',
        keyName: '',
        keyValue: '',
        isGlobal: true,
        metadata: {}
      })
      
      // API anahtarlarını yeniden yükle
      await loadApiKeys()
    } catch (error) {
      console.error('Failed to save API key:', error)
      
      // 409 conflict hatası için özel mesaj
      if (error.response?.status === 409) {
        setApiKeyOperationStatus({ 
          success: false, 
          message: `${newApiKey.serviceName} servisi için zaten bir API anahtarı mevcut. Mevcut anahtarı düzenlemek için listeden seçin.` 
        })
      } else {
        setApiKeyOperationStatus({ 
          success: false, 
          message: 'API anahtarı kaydedilirken hata oluştu: ' + (error.response?.data?.error || error.message)
        })
      }
    }
  }

  const handleEditApiKey = (apiKey) => {
    setEditingApiKey(apiKey)
    setNewApiKey({
      serviceName: apiKey.serviceName,
      keyName: apiKey.keyName,
      keyValue: apiKey.keyValue,
      isGlobal: apiKey.isGlobal,
      metadata: apiKey.metadata || {}
    })
    setShowApiKeyModal(true)
  }

  const handleDeleteApiKey = async (keyId) => {
    if (window.confirm('Bu API anahtarını silmek istediğinizden emin misiniz?')) {
      try {
        await apiKeyService.deleteKey(keyId)
        setApiKeyOperationStatus({ success: true, message: 'API anahtarı başarıyla silindi!' })
        await loadApiKeys()
      } catch (error) {
        console.error('Failed to delete API key:', error)
        setApiKeyOperationStatus({ success: false, message: 'API anahtarı silinirken hata oluştu: ' + error.message })
      }
    }
  }

  const handleCloseApiKeyModal = () => {
    setShowApiKeyModal(false)
    setEditingApiKey(null)
    setNewApiKey({
      serviceName: '',
      keyName: '',
      keyValue: '',
      isGlobal: true,
      metadata: {}
    })
  }

  // Bildirim gönderme fonksiyonları
  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      alert('Başlık ve mesaj alanları zorunludur!')
      return
    }

    setIsSendingNotification(true)
    
    try {
      const notification = {
        id: Date.now(),
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        timestamp: new Date().toISOString(),
        read: false,
        sender: 'Admin'
      }

      // Mevcut bildirimleri al
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      
      // Yeni bildirimi ekle
      const updatedNotifications = [notification, ...existingNotifications]
      
      // LocalStorage'a kaydet
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications))

      // Bildirim geçmişine ekle
      const historyItem = {
        ...notification,
        recipients: sendToAll ? 'Tüm Kullanıcılar' : `${selectedUsers.length} Kullanıcı`,
        sentAt: new Date().toLocaleString('tr-TR')
      }
      
      const updatedHistory = [historyItem, ...notificationHistory]
      setNotificationHistory(updatedHistory)
      
      // Geçmişi localStorage'a kaydet
      localStorage.setItem('notificationHistory', JSON.stringify(updatedHistory))

      // Formu temizle
      setNotificationTitle('')
      setNotificationMessage('')
      setNotificationType('info')
      setSendToAll(true)
      setSelectedUsers([])

      alert('Bildirim başarıyla gönderildi!')
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error)
      alert('Bildirim gönderilirken bir hata oluştu!')
    } finally {
      setIsSendingNotification(false)
    }
  }

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user.id))
    }
  }

  // Changelog yönetimi fonksiyonları
  const loadChangelogs = async () => {
    setIsLoadingChangelogs(true)
    try {
      // Admin panelinde tüm changelog'ları göster (yayınlanmış ve yayınlanmamış)
      const response = await fetch('http://localhost:5000/api/changelog?published=all&limit=50')
      if (!response.ok) {
        throw new Error('Changelog\'lar yüklenemedi')
      }
      const data = await response.json()
      setChangelogs(data.changelogs || [])
    } catch (error) {
      console.error('Changelog yükleme hatası:', error)
      setChangelogOperationStatus({ type: 'error', message: 'Changelog\'lar yüklenemedi' })
    } finally {
      setIsLoadingChangelogs(false)
    }
  }

  // Admin denetim günlüğü fonksiyonları
  const loadAuditLogs = async () => {
    setIsLoadingAuditLogs(true)
    try {
      const response = await fetch(`http://localhost:5000/api/users/admin/audit-logs?page=${auditLogsPage}&limit=20`)
      if (!response.ok) {
        throw new Error('Denetim günlükleri yüklenemedi')
      }
      const data = await response.json()
      setAuditLogs(data.data.logs || [])
      setAuditLogsPagination(data.data.pagination || {})
    } catch (error) {
      console.error('Denetim günlüğü yükleme hatası:', error)
    } finally {
      setIsLoadingAuditLogs(false)
    }
  }

  const getFilteredAuditLogs = () => {
    if (auditLogsFilter === 'all') return auditLogs
    return auditLogs.filter(log => log.action.toLowerCase().includes(auditLogsFilter.toLowerCase()))
  }

  const formatAuditLogAction = (action) => {
    const actionMap = {
      'CREATE_USER': '👤 Kullanıcı Oluşturma',
      'UPDATE_USER': '✏️ Kullanıcı Güncelleme',
      'DELETE_USER': '🗑️ Kullanıcı Silme',
      'LOGIN': '🔐 Giriş',
      'LOGOUT': '🚪 Çıkış',
      'CREATE_CHANGELOG': '📝 Changelog Oluşturma',
      'UPDATE_CHANGELOG': '📝 Changelog Güncelleme',
      'DELETE_CHANGELOG': '🗑️ Changelog Silme'
    }
    return actionMap[action] || action
  }

  const handleSaveChangelog = async () => {
    if (!newChangelog.title.trim() || !newChangelog.content.trim()) {
      setChangelogOperationStatus({ type: 'error', message: 'Başlık ve içerik alanları zorunludur!' })
      return
    }

    try {
      const url = editingChangelog 
        ? `http://localhost:5000/api/changelog/${editingChangelog.id}`
        : 'http://localhost:5000/api/changelog'
      
      const method = editingChangelog ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newChangelog,
          authorId: user.id
        })
      })

      if (!response.ok) {
        throw new Error('Changelog kaydedilemedi')
      }

      const savedChangelog = await response.json()
      
      if (editingChangelog) {
        setChangelogs(prev => prev.map(c => c.id === editingChangelog.id ? savedChangelog : c))
        setChangelogOperationStatus({ type: 'success', message: 'Changelog başarıyla güncellendi!' })
      } else {
        setChangelogs(prev => [savedChangelog, ...prev])
        setChangelogOperationStatus({ type: 'success', message: 'Changelog başarıyla oluşturuldu!' })
      }

      handleCloseChangelogModal()
    } catch (error) {
      console.error('Changelog kaydetme hatası:', error)
      setChangelogOperationStatus({ type: 'error', message: 'Changelog kaydedilemedi' })
    }
  }

  const handleDeleteChangelog = async (changelogId) => {
    if (!confirm('Bu changelog\'u silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/changelog/${changelogId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Changelog silinemedi')
      }

      setChangelogs(prev => prev.filter(c => c.id !== changelogId))
      setChangelogOperationStatus({ type: 'success', message: 'Changelog başarıyla silindi!' })
    } catch (error) {
      console.error('Changelog silme hatası:', error)
      setChangelogOperationStatus({ type: 'error', message: 'Changelog silinemedi' })
    }
  }

  const handleEditChangelog = (changelog) => {
    setEditingChangelog(changelog)
    setNewChangelog({
      title: changelog.title,
      content: changelog.content,
      version: changelog.version || '',
      type: changelog.type,
      isPublished: changelog.isPublished,
      releaseDate: changelog.releaseDate ? new Date(changelog.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    })
    setShowChangelogModal(true)
  }

  const handleCloseChangelogModal = () => {
    setShowChangelogModal(false)
    setEditingChangelog(null)
    setNewChangelog({
      title: '',
      content: '',
      version: '',
      type: 'update',
      isPublished: true, // Default olarak yayınlanmış
      releaseDate: new Date().toISOString().split('T')[0]
    })
    setChangelogOperationStatus(null)
  }

  // Bildirim takip fonksiyonları
  const loadNotificationStats = () => {
    try {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      const stats = {}
      
      notifications.forEach(notification => {
        const readCount = users.reduce((count, user) => {
          const userReadStatus = JSON.parse(localStorage.getItem(`notificationReadStatus_${user.id}`) || '{}')
          return count + (userReadStatus[notification.id] ? 1 : 0)
        }, 0)
        
        stats[notification.id] = {
          ...notification,
          totalUsers: users.length,
          readCount,
          unreadCount: users.length - readCount,
          readPercentage: users.length > 0 ? Math.round((readCount / users.length) * 100) : 0
        }
      })
      
      setNotificationStats(stats)
    } catch (error) {
      console.error('Bildirim istatistikleri yüklenirken hata:', error)
    }
  }

  const loadUserReadStats = (notificationId) => {
    try {
      const userStats = {}
      
      users.forEach(user => {
        const userReadStatus = JSON.parse(localStorage.getItem(`notificationReadStatus_${user.id}`) || '{}')
        userStats[user.id] = {
          ...user,
          hasRead: !!userReadStatus[notificationId],
          readAt: userReadStatus[`${notificationId}_readAt`] || null
        }
      })
      
      setUserReadStats(userStats)
    } catch (error) {
      console.error('Kullanıcı okuma istatistikleri yüklenirken hata:', error)
    }
  }

  // Trafik logları fonksiyonları
  const generateMockTrafficLogs = () => {
    const actions = ['login', 'logout', 'page_view', 'game_add', 'game_remove', 'search', 'profile_update']
    const pages = ['/', '/arkade', '/library', '/settings', '/stats', '/wishlist', '/gallery']
    const userAgents = [
      'Chrome 120.0.0.0 Windows',
      'Firefox 121.0 Windows',
      'Safari 17.2 macOS',
      'Edge 120.0.0.0 Windows'
    ]
    
    const logs = []
    const now = new Date()
    
    for (let i = 0; i < 100; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomAction = actions[Math.floor(Math.random() * actions.length)]
      const randomPage = pages[Math.floor(Math.random() * pages.length)]
      const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]
      
      // Son 7 gün içinde rastgele zaman
      const randomTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      
      logs.push({
        id: i + 1,
        userId: randomUser.id,
        username: randomUser.username,
        action: randomAction,
        page: randomPage,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: randomUserAgent,
        timestamp: randomTime.toISOString(),
        sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
        duration: Math.floor(Math.random() * 300) + 10 // 10-310 saniye
      })
    }
    
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  const loadTrafficLogs = () => {
    // Gerçek uygulamada bu veriler backend'den gelecek
    const logs = generateMockTrafficLogs()
    setTrafficLogs(logs)
  }

  const getFilteredTrafficLogs = () => {
    let filtered = trafficLogs
    
    // Aksiyon filtreleme
    if (trafficFilter !== 'all') {
      filtered = filtered.filter(log => log.action === trafficFilter)
    }
    
    // Tarih filtreleme
    const now = new Date()
    if (trafficDateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filtered = filtered.filter(log => new Date(log.timestamp) >= today)
    } else if (trafficDateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(log => new Date(log.timestamp) >= weekAgo)
    } else if (trafficDateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(log => new Date(log.timestamp) >= monthAgo)
    }
    
    return filtered
  }

  const getActionDisplayName = (action) => {
    const actionNames = {
      'login': 'Giriş',
      'logout': 'Çıkış',
      'page_view': 'Sayfa Görüntüleme',
      'game_add': 'Oyun Ekleme',
      'game_remove': 'Oyun Silme',
      'search': 'Arama',
      'profile_update': 'Profil Güncelleme'
    }
    return actionNames[action] || action
  }

  // Profil resmi yükleme fonksiyonları
  const handleAvatarUpload = async (formData) => {
    try {
      setIsUploadingAvatar(true)
      
      // Add user ID to form data
      formData.append('userId', user.id)
      
      // Upload to R2 via backend
      const result = await uploadService.uploadAvatar(formData)
      
      if (result.success) {
        // Update local state
        setProfileImage(result.data.url)
        
        // Update user context with new profile image
        const updatedUser = {
          ...user,
          profileImage: result.data.url
        }
        updateUser(updatedUser)
        
        console.log('Avatar başarıyla yüklendi:', result.data.url)
      }
    } catch (error) {
      console.error('Avatar yükleme hatası:', error)
      alert('Avatar yükleme sırasında hata oluştu: ' + error.message)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      setIsUploadingAvatar(true)
      
      const result = await uploadService.deleteAvatar(user.id)
      
      if (result.success) {
        // Update local state
        setProfileImage(null)
        
        // Update user context
        const updatedUser = {
          ...user,
          profileImage: null
        }
        updateUser(updatedUser)
        
        console.log('Avatar başarıyla silindi')
      }
    } catch (error) {
      console.error('Avatar silme hatası:', error)
      alert('Avatar silme sırasında hata oluştu: ' + error.message)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Legacy functions - keeping for backward compatibility
  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('avatar', file)
      handleAvatarUpload(formData)
    }
  }

  const handleCropComplete = (croppedImage) => {
    setProfileImage(croppedImage)
    setCroppedImageUrl(croppedImage)
    setShowImageCropper(false)
    saveProfileImage(croppedImage)
  }

  const saveProfileImage = (imageData) => {
    try {
      // LocalStorage'a profil resmini kaydet
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          profileImage: imageData
        }
      }
      updateUser(updatedUser)
      
      // Başarı mesajı göster (isteğe bağlı)
      console.log('Profil resmi başarıyla kaydedildi')
    } catch (error) {
      console.error('Profil resmi kaydetme hatası:', error)
    }
  }

  const getActionIcon = (action) => {
    const actionIcons = {
      'login': '🔓',
      'logout': '🔒',
      'page_view': '👁️',
      'game_add': '➕',
      'game_remove': '➖',
      'search': '🔍',
      'profile_update': '✏️'
    }
    return actionIcons[action] || '📝'
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profil Resmi Yükleme */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Profil Resmi</h3>
        </div>
        <div className="flex items-center gap-6">
          <ImageUpload
            onUpload={handleAvatarUpload}
            currentImage={profileImage}
            uploadType="avatar"
            maxSize={5}
            disabled={isUploadingAvatar}
            label={isUploadingAvatar ? "Yükleniyor..." : "Avatar Yükle"}
            className="flex-shrink-0"
          />
          <div>
            <h4 className="text-white font-medium mb-2">Profil Resmi Yükle</h4>
            <p className="text-gray-400 text-sm mb-3">
              JPG, PNG, GIF veya WebP formatında resim yükleyebilirsiniz. 
              Maksimum dosya boyutu 5MB'dır.
            </p>
            {profileImage && (
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAvatar}
                  disabled={isUploadingAvatar}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Sil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profil Bilgileri - Çok Yakında */}
      <div className="bg-gray-800/50 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            👤 Profil Bilgileri
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">Çok Yakında</span>
          </h3>
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">🚀</div>
            <h4 className="text-lg font-semibold text-white mb-2">Gelişmiş Profil Özellikleri</h4>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Yakında detaylı profil bilgileri, sosyal medya bağlantıları, oyun tercihleri ve daha fazlası burada olacak!
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">📱 Sosyal Medya</span>
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">🎮 Oyun Tercihleri</span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">🏆 Başarımlar</span>
              <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">⭐ Değerlendirmeler</span>
            </div>
          </div>
        </div>
      </div>

      {/* İstatistikler - Çok Yakında */}
      <div className="bg-gray-800/50 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            📊 İstatistikler
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Çok Yakında</span>
          </h3>
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">📈</div>
            <h4 className="text-lg font-semibold text-white mb-2">Detaylı Oyun İstatistikleri</h4>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Yakında oyun performansınız, ilerleme grafikleri, karşılaştırmalı analizler ve daha fazlası!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">???</div>
                <div className="text-gray-400 text-sm">Toplam Oyun</div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">???</div>
                <div className="text-gray-400 text-sm">Saat Oynandı</div>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">???</div>
                <div className="text-gray-400 text-sm">Başarım</div>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">???</div>
                <div className="text-gray-400 text-sm">Seviye</div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">📊 Grafikler</span>
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">🏆 Liderlik Tablosu</span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">📈 İlerleme</span>
              <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">🎯 Hedefler</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAdminPanel = () => (
    <div className="space-y-6">
      {/* Mevcut Kullanıcı Bilgi Kartı */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          👤 Mevcut Oturum
        </h4>
        <div className="flex items-center gap-4">
          {user?.profileImage ? (
            <img 
              src={user.profileImage} 
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-2 border-blue-400">
              <span className="text-white font-bold text-xl">{user?.username?.charAt(0)?.toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1">
            <div className="text-white font-bold text-lg">{user?.username}</div>
            <div className="text-blue-300">{user?.email}</div>
            <div className="text-gray-400 text-sm">Rol: {user?.role === 'admin' ? '👑 Admin' : '👤 Kullanıcı'}</div>
            <div className="text-gray-400 text-sm">User ID: <span className="font-mono text-blue-300">{user?.id}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          👑 Admin Panel
        </h3>
        {/* İçerik - sol sidebar seçimlerine göre */}
        {adminActiveTab === 'users' && (
          <div>
            {/* Pending Kullanıcılar Bölümü */}
            {pendingUsers.length > 0 && (
              <div className="mb-8 bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-6">
                <h5 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                  ⏳ Onay Bekleyen Kullanıcılar ({pendingUsers.length})
                </h5>
                <div className="space-y-3">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <span className="text-white font-bold">{user.username?.charAt(0)?.toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                          <div className="text-white font-medium">{user.username}</div>
                          <div className="text-gray-400 text-sm">{user.email}</div>
                          <div className="text-gray-500 text-xs">
                            Kayıt: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          ✓ Onayla
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          ✗ Reddet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-white">Kullanıcı Yönetimi</h4>
              <button 
                onClick={handleAddNewUser}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + Yeni Kullanıcı
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-300 py-3 px-4">Kullanıcı</th>
                    <th className="text-left text-gray-300 py-3 px-4">User ID</th>
                    <th className="text-left text-gray-300 py-3 px-4">Email</th>
                    <th className="text-left text-gray-300 py-3 px-4">Rol</th>
                    <th className="text-left text-gray-300 py-3 px-4">Durum</th>
                    <th className="text-left text-gray-300 py-3 px-4">Son Giriş</th>
                    <th className="text-left text-gray-300 py-3 px-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {user.profileImage ? (
                              <img 
                                src={user.profileImage} 
                                alt={user.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{user.username?.charAt(0)?.toUpperCase()}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="text-white font-medium">{user.username}</div>
                              <div className="text-gray-400 text-sm">{user.name || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim()}</div>
                            </div>
                            
                            {/* Expandable Butonlar */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setExpandedUserDetails(prev => ({
                                  ...prev,
                                  [`${user.id}_data`]: !prev[`${user.id}_data`]
                                }))}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  expandedUserDetails[`${user.id}_data`]
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                                title="Veri kullanımını göster/gizle"
                              >
                                📊 Veri
                              </button>
                              <button
                                onClick={() => {
                                  const isExpanding = !expandedUserDetails[`${user.id}_security`]
                                  setExpandedUserDetails(prev => ({
                                    ...prev,
                                    [`${user.id}_security`]: isExpanding
                                  }))
                                  // Güvenlik bilgileri açılıyorsa ve henüz yüklenmemişse yükle
                                  if (isExpanding && !user.security) {
                                    loadUserSecurity(user.id)
                                  }
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  expandedUserDetails[`${user.id}_security`]
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                                title="Güvenlik bilgilerini göster/gizle"
                              >
                                🔒 Güvenlik
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                            ...{user.id.slice(-5)}
                          </span>
                        </td>
                      <td className="py-3 px-4 text-gray-300">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : user.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.status === 'active' ? 'Aktif' : user.status === 'pending' ? 'Beklemede' : 'Pasif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{user.lastLogin}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Düzenle
                          </button>
                          {user.id !== 1 && (
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Sil
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Veri Kullanımı Detay Satırı */}
                    {expandedUserDetails[`${user.id}_data`] && (
                      <tr className="bg-blue-500/5 border-b border-gray-700/50">
                        <td colSpan="6" className="py-4 px-4">
                          <div className="bg-gray-700/30 rounded-lg p-4">
                            <h5 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                              📊 Veri Kullanımı Detayları
                            </h5>
                            
                            {/* Genel Kullanım */}
                            <div className="mb-6">
                              <h6 className="text-gray-300 text-sm font-medium mb-3">Genel Kullanım</h6>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">İndirilen</div>
                                  <div className="text-green-400 font-semibold">{user.dataUsage?.totalDownloaded || '0 GB'}</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">Yüklenen</div>
                                  <div className="text-blue-400 font-semibold">{user.dataUsage?.totalUploaded || '0 GB'}</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">Aylık Kullanım</div>
                                  <div className="text-yellow-400 font-semibold">{user.dataUsage?.monthlyUsage || '0 GB'}</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">Son Aktivite</div>
                                  <div className="text-gray-300 font-semibold">{user.dataUsage?.lastActivity || 'Bilinmiyor'}</div>
                                </div>
                              </div>
                            </div>

                            {/* R2 Depolama Kullanımı */}
                            <div className="mb-6">
                              <h6 className="text-gray-300 text-sm font-medium mb-3 flex items-center gap-2">
                                <span>☁️</span>
                                R2 Depolama Kullanımı
                              </h6>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">Kullanılan Alan</div>
                                  <div className="text-purple-400 font-semibold">{user.r2Usage?.usedSpace || '0 MB'}</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">Dosya Sayısı</div>
                                  <div className="text-cyan-400 font-semibold">{user.r2Usage?.fileCount || '0'}</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">İstek Sayısı</div>
                                  <div className="text-orange-400 font-semibold">{user.r2Usage?.requestCount || '0'}</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">Son R2 Kullanımı</div>
                                  <div className="text-gray-300 font-semibold">{user.r2Usage?.lastUsed || 'Hiç kullanılmamış'}</div>
                                </div>
                              </div>
                            </div>

                            {/* Supabase Kullanımı */}
                            <div>
                              <h6 className="text-gray-300 text-sm font-medium mb-3 flex items-center gap-2">
                                <span>🗄️</span>
                                Supabase Database Kullanımı
                              </h6>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">Sorgu Sayısı</div>
                                  <div className="text-emerald-400 font-semibold">{user.supabaseUsage?.queryCount || '0'}</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">Veri Boyutu</div>
                                  <div className="text-teal-400 font-semibold">{user.supabaseUsage?.dataSize || '0 KB'}</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">Bağlantı Süresi</div>
                                  <div className="text-indigo-400 font-semibold">{user.supabaseUsage?.connectionTime || '0 dk'}</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="text-gray-400 text-xs mb-1">Son DB Erişimi</div>
                                  <div className="text-gray-300 font-semibold">{user.supabaseUsage?.lastAccess || 'Hiç erişilmemiş'}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {/* Güvenlik Detay Satırı */}
                    {expandedUserDetails[`${user.id}_security`] && (
                      <tr className="bg-red-500/5 border-b border-gray-700/50">
                        <td colSpan="6" className="py-4 px-4">
                          <div className="bg-gray-700/30 rounded-lg p-4">
                            <h5 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                              🔒 Güvenlik Bilgileri
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <div className="text-gray-400 text-xs mb-1">Şifre Gücü</div>
                                <div className={`font-semibold ${
                                  user.security?.passwordStrength === 'Güçlü' ? 'text-green-400' :
                                  user.security?.passwordStrength === 'Orta' ? 'text-yellow-400' : 'text-red-400'
                                }`}>{user.security?.passwordStrength || 'Bilinmiyor'}</div>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <div className="text-gray-400 text-xs mb-1">Son Şifre Değişimi</div>
                                <div className="text-gray-300 font-semibold">{user.security?.lastPasswordChange || 'Bilinmiyor'}</div>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <div className="text-gray-400 text-xs mb-1">2FA Durumu</div>
                                <div className={`font-semibold ${user.security?.twoFactorEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                  {user.security?.twoFactorEnabled ? 'Aktif' : 'Pasif'}
                                </div>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <div className="text-gray-400 text-xs mb-1">Hesap Durumu</div>
                                <div className={`font-semibold ${user.security?.accountLocked ? 'text-red-400' : 'text-green-400'}`}>
                                  {user.security?.accountLocked ? 'Kilitli' : 'Normal'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Şifre Gösterme Alanı */}
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-gray-400 text-xs mb-1">Kullanıcı Şifresi</div>
                                  <div className="text-white font-mono text-sm">
                                    {showPasswords[user.id] ? user.password : '••••••••••••'}
                                  </div>
                                </div>
                                <button
                                  onClick={() => togglePasswordVisibility(user.id)}
                                  className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm flex items-center gap-2"
                                >
                                  {showPasswords[user.id] ? '🙈 Gizle' : '👁️ Göster'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
           </div>
         )}

        {adminActiveTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">📢 Bildirim Yönetimi</h4>
              <div className="text-sm text-gray-400">
                Tüm kullanıcılara bildirim gönder
              </div>
            </div>

            {/* Bildirim Gönderme Formu */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                ✉️ Yeni Bildirim Gönder
              </h5>
              
              <div className="space-y-4">
                {/* Başlık */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="Bildirim başlığı..."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Mesaj */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Mesaj
                  </label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Bildirim mesajı..."
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Bildirim Tipi */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Bildirim Tipi
                  </label>
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="info">📘 Bilgi</option>
                    <option value="success">✅ Başarı</option>
                    <option value="warning">⚠️ Uyarı</option>
                    <option value="error">❌ Hata</option>
                    <option value="announcement">📢 Duyuru</option>
                  </select>
                </div>

                {/* Alıcı Seçimi */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Alıcılar
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={sendToAll}
                        onChange={() => setSendToAll(true)}
                        className="text-blue-500"
                      />
                      <span className="text-gray-300">Tüm Kullanıcılar</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!sendToAll}
                        onChange={() => setSendToAll(false)}
                        className="text-blue-500"
                      />
                      <span className="text-gray-300">Seçili Kullanıcılar</span>
                    </label>
                  </div>

                  {!sendToAll && (
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">Kullanıcı Seçimi</span>
                        <button
                          onClick={handleSelectAllUsers}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          {selectedUsers.length === users.length ? 'Hiçbirini Seçme' : 'Tümünü Seç'}
                        </button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {users.map((user) => (
                          <label key={user.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleUserSelection(user.id)}
                              className="text-blue-500"
                            />
                            <span className="text-gray-300 text-sm">{user.username}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Gönder Butonu */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSendNotification}
                    disabled={isSendingNotification || !notificationTitle.trim() || !notificationMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isSendingNotification ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        📤 Bildirim Gönder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bildirim Geçmişi */}
            {notificationHistory.length > 0 && (
              <div className="bg-gray-700/50 rounded-lg p-6">
                <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                  📋 Gönderilen Bildirimler
                </h5>
                
                <div className="space-y-3">
                  {notificationHistory.slice(0, 10).map((notification, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{notification.title}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              notification.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                              notification.type === 'success' ? 'bg-green-500/20 text-green-400' :
                              notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                              notification.type === 'error' ? 'bg-red-500/20 text-red-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {notification.type === 'info' ? 'Bilgi' :
                               notification.type === 'success' ? 'Başarı' :
                               notification.type === 'warning' ? 'Uyarı' :
                               notification.type === 'error' ? 'Hata' : 'Duyuru'}
                            </span>
                          </div>
                          <div className="text-gray-300 text-sm mb-2 prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{notification.message}</ReactMarkdown>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>👥 {notification.recipients}</span>
                            <span>📅 {notification.sentAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {adminActiveTab === 'audit-logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">🔍 Admin Denetim Günlüğü</h4>
              <div className="flex items-center gap-3">
                <select
                  value={auditLogsFilter}
                  onChange={(e) => setAuditLogsFilter(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 text-sm"
                >
                  <option value="all">Tüm Eylemler</option>
                  <option value="create">Oluşturma</option>
                  <option value="update">Güncelleme</option>
                  <option value="delete">Silme</option>
                  <option value="login">Giriş/Çıkış</option>
                </select>
                <button 
                  onClick={() => loadAuditLogs()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  🔄 Yenile
                </button>
              </div>
            </div>

            {/* Denetim Günlükleri */}
            <div className="bg-gray-700/40 rounded-xl p-4">
              {isLoadingAuditLogs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Denetim günlükleri yükleniyor...</p>
                </div>
              ) : getFilteredAuditLogs().length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Henüz denetim günlüğü bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredAuditLogs().map((log) => (
                    <div key={log.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">{formatAuditLogAction(log.action)}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              log.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {log.success ? '✅ Başarılı' : '❌ Başarısız'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Admin:</span>
                              <span className="text-white ml-2">{log.admin?.username || 'Bilinmiyor'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Tarih:</span>
                              <span className="text-white ml-2">
                                {new Date(log.createdAt).toLocaleString('tr-TR')}
                              </span>
                            </div>
                            {log.targetType && (
                              <div>
                                <span className="text-gray-400">Hedef:</span>
                                <span className="text-white ml-2">{log.targetType}</span>
                                {log.targetName && (
                                  <span className="text-gray-300 ml-1">({log.targetName})</span>
                                )}
                              </div>
                            )}
                            <div>
                              <span className="text-gray-400">IP:</span>
                              <span className="text-white ml-2">{log.ipAddress || 'Bilinmiyor'}</span>
                            </div>
                          </div>

                          {log.details && (
                            <div className="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                              <span className="text-gray-400 text-sm">Detaylar:</span>
                              <pre className="text-gray-300 text-xs mt-1 whitespace-pre-wrap">
                                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}

                          {!log.success && log.errorMessage && (
                            <div className="mt-3 p-3 bg-red-900/20 rounded border border-red-700">
                              <span className="text-red-400 text-sm">Hata:</span>
                              <p className="text-red-300 text-sm mt-1">{log.errorMessage}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sayfalama */}
              {auditLogsPagination && auditLogsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-600">
                  <div className="text-sm text-gray-400">
                    Sayfa {auditLogsPagination.currentPage} / {auditLogsPagination.totalPages} 
                    ({auditLogsPagination.totalItems} kayıt)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAuditLogsPage(auditLogsPage - 1)
                        loadAuditLogs()
                      }}
                      disabled={auditLogsPage <= 1}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
                    >
                      ← Önceki
                    </button>
                    <button
                      onClick={() => {
                        setAuditLogsPage(auditLogsPage + 1)
                        loadAuditLogs()
                      }}
                      disabled={auditLogsPage >= auditLogsPagination.totalPages}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
                    >
                      Sonraki →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {adminActiveTab === 'api-logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">📊 API Logları</h4>
              <button 
                onClick={() => setApiStats(igdbApi.getApiStats())}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🔄 Yenile
              </button>
            </div>

            {/* Log İstatistikleri Özeti */}
            {apiStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{apiStats.last30Days.total}</div>
                    <div className="text-gray-400 text-sm">Toplam İstek (30 gün)</div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {apiStats.last30Days.total > 0 
                        ? Math.round((apiStats.last30Days.successful / apiStats.last30Days.total) * 100)
                        : 0}%
                    </div>
                    <div className="text-gray-400 text-sm">Başarı Oranı</div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{apiStats.last30Days.failed}</div>
                    <div className="text-gray-400 text-sm">Başarısız İstek</div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{apiStats.last30Days.avgResponseTime}ms</div>
                    <div className="text-gray-400 text-sm">Ort. Yanıt Süresi</div>
                  </div>
                </div>
              </div>
            )}

            {/* Detaylı Log Tablosu */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                📋 Detaylı API Logları
              </h5>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Zaman</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Endpoint</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Durum</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Yanıt Süresi</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Hata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {igdbApi.getApiLogs().slice(-50).reverse().map((log) => (
                      <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-600/20">
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {new Date(log.timestamp).toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          /{log.endpoint}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.success 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {log.success ? '✅ Başarılı' : '❌ Başarısız'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-yellow-400 font-medium">
                          {log.responseTime}ms
                        </td>
                        <td className="py-3 px-4 text-red-400 text-sm">
                          {log.error || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {igdbApi.getApiLogs().length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Henüz API log kaydı bulunmuyor
                  </div>
                )}
              </div>
            </div>

            {/* Log Temizleme */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                🗑️ Log Yönetimi
              </h5>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">
                    Loglar otomatik olarak 30 gün sonra silinir. Manuel temizleme için butonu kullanabilirsiniz.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Toplam log sayısı: {igdbApi.getApiLogs().length}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm('Tüm API loglarını silmek istediğinizden emin misiniz?')) {
                      localStorage.removeItem('igdb_api_logs')
                      setApiStats(igdbApi.getApiStats())
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  🗑️ Tüm Logları Temizle
                </button>
              </div>
            </div>
          </div>
        )}

        {adminActiveTab === 'tracking' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">📊 Bildirim Takip Sistemi</h4>
              <button 
                onClick={loadNotificationStats}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🔄 Yenile
              </button>
            </div>

            {/* Bildirim İstatistikleri Özeti */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{Object.keys(notificationStats).length}</div>
                  <div className="text-gray-400 text-sm">Toplam Bildirim</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {Object.keys(notificationStats).length > 0 
                      ? Math.round(Object.values(notificationStats).reduce((sum, stat) => sum + stat.readPercentage, 0) / Object.keys(notificationStats).length)
                      : 0}%
                  </div>
                  <div className="text-gray-400 text-sm">Ortalama Okunma</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{users.length}</div>
                  <div className="text-gray-400 text-sm">Aktif Kullanıcı</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {Object.values(notificationStats).reduce((sum, stat) => sum + stat.unreadCount, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Okunmamış Toplam</div>
                </div>
              </div>
            </div>

            {/* Bildirim Listesi */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                📋 Bildirim Detayları
              </h5>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Bildirim</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Tip</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Gönderilme</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Okunma Oranı</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(notificationStats).map((stat) => (
                      <tr key={stat.id} className="border-b border-gray-700/50 hover:bg-gray-600/20">
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-white font-medium">{stat.title}</div>
                            <div className="text-gray-400 text-sm truncate max-w-xs">{stat.message}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stat.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                            stat.type === 'success' ? 'bg-green-500/20 text-green-400' :
                            stat.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            stat.type === 'error' ? 'bg-red-500/20 text-red-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {stat.type === 'info' && 'ℹ️ Bilgi'}
                            {stat.type === 'success' && '✅ Başarı'}
                            {stat.type === 'warning' && '⚠️ Uyarı'}
                            {stat.type === 'error' && '❌ Hata'}
                            {stat.type === 'announcement' && '📢 Duyuru'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {new Date(stat.timestamp).toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-600 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  stat.readPercentage >= 80 ? 'bg-green-500' :
                                  stat.readPercentage >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${stat.readPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-sm font-medium min-w-[3rem]">
                              {stat.readCount}/{stat.totalUsers}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => {
                              setSelectedNotificationId(stat.id)
                              loadUserReadStats(stat.id)
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Detay Gör
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {Object.keys(notificationStats).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Henüz bildirim bulunmuyor. İstatistikleri yüklemek için "Yenile" butonuna tıklayın.
                  </div>
                )}
              </div>
            </div>

            {/* Kullanıcı Detay Modal */}
            {selectedNotificationId && (
              <div className="bg-gray-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-white font-medium flex items-center gap-2">
                    👥 Kullanıcı Okuma Detayları
                  </h5>
                  <button 
                    onClick={() => setSelectedNotificationId(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Kullanıcı</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Durum</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Okunma Zamanı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(userReadStats).map((userStat) => (
                        <tr key={userStat.id} className="border-b border-gray-700/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{userStat.avatar}</span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{userStat.username}</div>
                                <div className="text-gray-400 text-sm">{userStat.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              userStat.hasRead 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {userStat.hasRead ? '✅ Okundu' : '❌ Okunmadı'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-sm">
                            {userStat.readAt ? new Date(userStat.readAt).toLocaleString('tr-TR') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Kullanıcı Bazlı Genel İstatistikler */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                👥 Kullanıcı Bazlı İstatistikler
              </h5>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Kullanıcı</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Toplam Bildirim</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Okunan</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Okunmayan</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Okunma Oranı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const userReadStatus = JSON.parse(localStorage.getItem(`notificationReadStatus_${user.id}`) || '{}')
                      const totalNotifications = Object.keys(notificationStats).length
                      const readCount = Object.keys(notificationStats).filter(notificationId => 
                        userReadStatus[notificationId]
                      ).length
                      const unreadCount = totalNotifications - readCount
                      const readPercentage = totalNotifications > 0 ? Math.round((readCount / totalNotifications) * 100) : 0

                      return (
                        <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-600/20">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{user.avatar}</span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{user.username}</div>
                                <div className="text-gray-400 text-sm">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-blue-400 font-medium">{totalNotifications}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-green-400 font-medium">{readCount}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-red-400 font-medium">{unreadCount}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-600 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    readPercentage >= 80 ? 'bg-green-500' :
                                    readPercentage >= 50 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${readPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-white text-sm font-medium min-w-[3rem]">
                                {readPercentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Henüz kullanıcı bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {adminActiveTab === 'traffic' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">🚦 Trafik Logları</h4>
              <button 
                onClick={loadTrafficLogs}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🔄 Yenile
              </button>
            </div>

            {/* Filtreler */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                🔍 Filtreler
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Aksiyon Türü
                  </label>
                  <select
                    value={trafficFilter}
                    onChange={(e) => setTrafficFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white"
                  >
                    <option value="all">Tümü</option>
                    <option value="login">Giriş</option>
                    <option value="logout">Çıkış</option>
                    <option value="page_view">Sayfa Görüntüleme</option>
                    <option value="game_add">Oyun Ekleme</option>
                    <option value="game_remove">Oyun Silme</option>
                    <option value="search">Arama</option>
                    <option value="profile_update">Profil Güncelleme</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Zaman Aralığı
                  </label>
                  <select
                    value={trafficDateRange}
                    onChange={(e) => setTrafficDateRange(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white"
                  >
                    <option value="today">Bugün</option>
                    <option value="week">Son 7 Gün</option>
                    <option value="month">Son 30 Gün</option>
                    <option value="all">Tümü</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Trafik İstatistikleri */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{getFilteredTrafficLogs().length}</div>
                  <div className="text-gray-400 text-sm">Toplam Aktivite</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {new Set(getFilteredTrafficLogs().map(log => log.userId)).size}
                  </div>
                  <div className="text-gray-400 text-sm">Aktif Kullanıcı</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {getFilteredTrafficLogs().filter(log => log.action === 'login').length}
                  </div>
                  <div className="text-gray-400 text-sm">Giriş Sayısı</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.round(getFilteredTrafficLogs().reduce((sum, log) => sum + log.duration, 0) / getFilteredTrafficLogs().length) || 0}s
                  </div>
                  <div className="text-gray-400 text-sm">Ort. Oturum Süresi</div>
                </div>
              </div>
            </div>

            {/* Trafik Logları Tablosu */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                📋 Detaylı Trafik Logları
              </h5>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Zaman</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Kullanıcı</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Aksiyon</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Sayfa</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">IP Adresi</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Tarayıcı</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTrafficLogs().slice(0, 50).map((log) => (
                      <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-600/20">
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {new Date(log.timestamp).toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white font-bold text-xs">{log.username[0].toUpperCase()}</span>
                            </div>
                            <span className="text-white font-medium">{log.username}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getActionIcon(log.action)}</span>
                            <span className="text-white">{getActionDisplayName(log.action)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300 font-mono text-sm">
                          {log.page}
                        </td>
                        <td className="py-3 px-4 text-gray-400 font-mono text-sm">
                          {log.ip}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {log.userAgent}
                        </td>
                        <td className="py-3 px-4 text-yellow-400 font-medium">
                          {log.duration}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getFilteredTrafficLogs().length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Seçilen filtrelere uygun trafik kaydı bulunamadı
                  </div>
                )}
              </div>
              
              {getFilteredTrafficLogs().length > 50 && (
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">
                    Toplam {getFilteredTrafficLogs().length} kayıt bulundu, ilk 50 tanesi gösteriliyor.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {adminActiveTab === 'api' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">🔌 API Yönetim Merkezi</h4>
              <div className="flex items-center gap-2">
                {connectionStatus && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    connectionStatus.success 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {connectionStatus.success ? '✅ Bağlı' : '❌ Bağlantı Hatası'}
                  </span>
                )}
              </div>
            </div>

            {/* İki Sütunlu Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sol Taraf - API Yönetimi (2/3) */}
              <div className="lg:col-span-2 space-y-6">

            {/* API Anahtarları */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                🔑 API Anahtarları
              </h5>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={igdbClientId}
                    onChange={(e) => setIgdbClientId(e.target.value)}
                    placeholder={igdbClientId ? "IGDB Client ID'nizi girin" : "🔍 Key bulunamadı - IGDB Client ID'nizi girin"}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={igdbAccessToken}
                    onChange={(e) => setIgdbAccessToken(e.target.value)}
                    placeholder={igdbAccessToken ? "IGDB Access Token'ınızı girin" : "🔍 Key bulunamadı - IGDB Access Token'ınızı girin"}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleSaveApiCredentials}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    💾 Kaydet
                  </button>
                  <button 
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    {isTestingConnection ? '⏳ Test Ediliyor...' : '🔍 Bağlantıyı Test Et'}
                  </button>
                  <button 
                    onClick={handleClearCredentials}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    🗑️ Temizle
                  </button>
                </div>
                
                {connectionStatus && (
                  <div className={`p-3 rounded-lg text-sm ${
                    connectionStatus.success 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {connectionStatus.message}
                  </div>
                )}
              </div>
            </div>

            {/* API İstatistikleri */}
            {apiStats && (
              <div className="bg-gray-700/50 rounded-lg p-6">
                <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                  📊 API İstatistikleri
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bugün */}
                  <div className="bg-gray-600/30 rounded-lg p-4">
                    <h6 className="text-gray-300 text-sm font-medium mb-3">📅 Bugün</h6>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Toplam:</span>
                        <span className="text-white font-medium">{apiStats.today.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Başarılı:</span>
                        <span className="text-green-400 font-medium">{apiStats.today.successful}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Başarısız:</span>
                        <span className="text-red-400 font-medium">{apiStats.today.failed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Ort. Yanıt:</span>
                        <span className="text-yellow-400 font-medium">{apiStats.today.avgResponseTime}ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Son 7 Gün */}
                  <div className="bg-gray-600/30 rounded-lg p-4">
                    <h6 className="text-gray-300 text-sm font-medium mb-3">📈 Son 7 Gün</h6>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Toplam:</span>
                        <span className="text-white font-medium">{apiStats.last7Days.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Başarılı:</span>
                        <span className="text-green-400 font-medium">{apiStats.last7Days.successful}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Başarısız:</span>
                        <span className="text-red-400 font-medium">{apiStats.last7Days.failed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Ort. Yanıt:</span>
                        <span className="text-yellow-400 font-medium">{apiStats.last7Days.avgResponseTime}ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Son 30 Gün */}
                  <div className="bg-gray-600/30 rounded-lg p-4">
                    <h6 className="text-gray-300 text-sm font-medium mb-3">📊 Son 30 Gün</h6>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Toplam:</span>
                        <span className="text-white font-medium">{apiStats.last30Days.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Başarılı:</span>
                        <span className="text-green-400 font-medium">{apiStats.last30Days.successful}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Başarısız:</span>
                        <span className="text-red-400 font-medium">{apiStats.last30Days.failed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Ort. Yanıt:</span>
                        <span className="text-yellow-400 font-medium">{apiStats.last30Days.avgResponseTime}ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Endpoint İstatistikleri */}
                {Object.keys(apiStats.endpoints).length > 0 && (
                  <div className="mt-6">
                    <h6 className="text-gray-300 text-sm font-medium mb-3">🎯 Endpoint İstatistikleri</h6>
                    <div className="space-y-2">
                      {Object.entries(apiStats.endpoints).map(([endpoint, stats]) => (
                        <div key={endpoint} className="bg-gray-600/20 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">/{endpoint}</span>
                            <div className="flex gap-4 text-xs">
                              <span className="text-gray-400">Toplam: {stats.total}</span>
                              <span className="text-green-400">✓ {stats.successful}</span>
                              <span className="text-red-400">✗ {stats.failed}</span>
                              <span className="text-yellow-400">{stats.avgResponseTime}ms</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Steam API Yönetimi */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-white font-medium flex items-center gap-2">
                  🎮 Steam API Yönetimi
                </h5>
                {steamConnectionStatus && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    steamConnectionStatus.success 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {steamConnectionStatus.success ? '✅ Bağlı' : '❌ Bağlantı Hatası'}
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Steam API Key
                  </label>
                  <input
                    type="password"
                    value={steamApiKey}
                    onChange={(e) => setSteamApiKey(e.target.value)}
                    placeholder={steamApiKey ? "Steam API anahtarınızı girin" : "🔍 Key bulunamadı - Steam API anahtarınızı girin"}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveSteamApiKey}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    💾 Kaydet
                  </button>
                  
                  <button
                    onClick={handleTestSteamConnection}
                    disabled={isTestingSteamConnection}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {isTestingSteamConnection ? '⏳ Test Ediliyor...' : '🔍 Bağlantıyı Test Et'}
                  </button>
                  
                  <button
                    onClick={handleClearSteamCredentials}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    🗑️ Temizle
                  </button>
                </div>
                
                {steamConnectionStatus && (
                  <div className={`p-3 rounded-lg text-sm ${
                    steamConnectionStatus.success 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {steamConnectionStatus.message}
                  </div>
                )}
              </div>
            </div>

            {/* Supabase API Yönetimi */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-white font-medium flex items-center gap-2">
                  🗄️ Supabase API Yönetimi
                </h5>
                {supabaseConnectionStatus && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    supabaseConnectionStatus.success 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {supabaseConnectionStatus.success ? '✅ Bağlı' : '❌ Bağlantı Hatası'}
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Supabase URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder={supabaseUrl ? "https://your-project.supabase.co" : "🔍 Key bulunamadı - Supabase URL'nizi girin"}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder={supabaseAnonKey ? "Supabase anon public API anahtarınızı girin" : "🔍 Key bulunamadı - Supabase anon public API anahtarınızı girin"}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveSupabaseCredentials}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    💾 Kaydet
                  </button>
                  
                  <button
                    onClick={handleTestSupabaseConnection}
                    disabled={isTestingSupabaseConnection}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {isTestingSupabaseConnection ? '⏳ Test Ediliyor...' : '🔍 Bağlantıyı Test Et'}
                  </button>
                  
                  <button
                    onClick={handleClearSupabaseCredentials}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    🗑️ Temizle
                  </button>
                </div>
                
                {supabaseConnectionStatus && (
                  <div className={`p-3 rounded-lg text-sm ${
                    supabaseConnectionStatus.success 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {supabaseConnectionStatus.message}
                  </div>
                )}
              </div>
            </div>
              </div>

              {/* Sağ Taraf - Kullanım Kılavuzları (1/3) */}
              <div className="space-y-6">
                {/* API Kullanım Kılavuzu */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                📖 IGDB API Kurulum Kılavuzu
              </h5>
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h6 className="text-blue-400 font-medium mb-2">1. Twitch Developer Console</h6>
                  <p>
                    <a href="https://dev.twitch.tv/console" target="_blank" rel="noopener noreferrer" 
                       className="text-blue-400 hover:text-blue-300 underline">
                      https://dev.twitch.tv/console
                    </a> adresine gidin ve yeni bir uygulama oluşturun.
                  </p>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h6 className="text-green-400 font-medium mb-2">2. Client ID</h6>
                  <p>Oluşturduğunuz uygulamanın Client ID'sini kopyalayın.</p>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h6 className="text-yellow-400 font-medium mb-2">3. Access Token</h6>
                  <p>OAuth2 Client Credentials flow kullanarak access token alın:</p>
                  <code className="block mt-2 p-2 bg-gray-800 rounded text-xs">
                    POST https://id.twitch.tv/oauth2/token<br/>
                    client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&grant_type=client_credentials
                  </code>
                </div>
              </div>
            </div>

            {/* Steam API Kullanım Kılavuzu */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                🎮 Steam API Kurulum Kılavuzu
              </h5>
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h6 className="text-blue-400 font-medium mb-2">1. Steam Developer Portal</h6>
                  <p>
                    <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noopener noreferrer" 
                       className="text-blue-400 hover:text-blue-300 underline">
                      https://steamcommunity.com/dev/apikey
                    </a> adresine gidin ve Steam hesabınızla giriş yapın.
                  </p>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h6 className="text-green-400 font-medium mb-2">2. API Key Oluşturma</h6>
                  <p>Domain Name alanına herhangi bir domain yazabilirsiniz (örn: localhost). API anahtarınızı kopyalayın.</p>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h6 className="text-yellow-400 font-medium mb-2">3. Kullanım</h6>
                  <p>Steam API ile oyun bilgileri, kullanıcı kütüphaneleri ve başarımlar gibi verilere erişebilirsiniz.</p>
                </div>
              </div>
            </div>

            {/* Supabase API Kullanım Kılavuzu */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                🗄️ Supabase API Kurulum Kılavuzu
              </h5>
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h6 className="text-blue-400 font-medium mb-2">1. Supabase Dashboard</h6>
                  <p>
                    <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" 
                       className="text-blue-400 hover:text-blue-300 underline">
                      https://supabase.com/dashboard
                    </a> adresine gidin ve projenizi seçin.
                  </p>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h6 className="text-green-400 font-medium mb-2">2. API Anahtarları</h6>
                  <p>Settings → API kısmından Project URL ve anon public API anahtarınızı kopyalayın.</p>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h6 className="text-yellow-400 font-medium mb-2">3. Kullanım</h6>
                  <p>Supabase ile veritabanı işlemleri, authentication ve real-time özellikler kullanabilirsiniz.</p>
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>
        )}

        {adminActiveTab === 'api-keys' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">🔑 API Anahtar Yönetimi</h4>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Yeni API Anahtarı
              </button>
            </div>

            {/* Status Message */}
            {apiKeyOperationStatus && (
              <div className={`p-4 rounded-lg text-sm ${
                apiKeyOperationStatus.success 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {apiKeyOperationStatus.message}
              </div>
            )}

            {/* API Keys List */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-white font-medium">Kayıtlı API Anahtarları</h5>
                {isLoadingApiKeys && (
                  <div className="text-gray-400 text-sm">Yükleniyor...</div>
                )}
              </div>

              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🔑</div>
                  <p>Henüz kayıtlı API anahtarı bulunmuyor.</p>
                  <p className="text-sm mt-1">Yeni bir API anahtarı eklemek için yukarıdaki butonu kullanın.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="bg-gray-600/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h6 className="text-white font-medium">{apiKey.serviceName}</h6>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-300">{apiKey.keyName}</span>
                            {apiKey.isGlobal && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                Global
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                              {apiKey.keyValue.substring(0, 20)}...
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Oluşturulma: {new Date(apiKey.createdAt).toLocaleString('tr-TR')}
                            {apiKey.updatedAt !== apiKey.createdAt && (
                              <span> • Güncelleme: {new Date(apiKey.updatedAt).toLocaleString('tr-TR')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditApiKey(apiKey)}
                            className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded text-sm transition-colors"
                          >
                            ✏️ Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm transition-colors"
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* API Key Modal */}
            {showApiKeyModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-white font-medium">
                      {editingApiKey ? 'API Anahtarını Düzenle' : 'Yeni API Anahtarı Ekle'}
                    </h5>
                    <button
                      onClick={handleCloseApiKeyModal}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Servis Adı
                      </label>
                      <input
                        type="text"
                        value={newApiKey.serviceName}
                        onChange={(e) => setNewApiKey({...newApiKey, serviceName: e.target.value})}
                        placeholder="Örn: IGDB, Steam, OpenAI"
                        className="w-full px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Anahtar Adı
                      </label>
                      <input
                        type="text"
                        value={newApiKey.keyName}
                        onChange={(e) => setNewApiKey({...newApiKey, keyName: e.target.value})}
                        placeholder="Örn: client_id, api_key, access_token"
                        className="w-full px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Anahtar Değeri
                      </label>
                      <textarea
                        value={newApiKey.keyValue}
                        onChange={(e) => setNewApiKey({...newApiKey, keyValue: e.target.value})}
                        placeholder="API anahtarınızı buraya girin"
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isGlobal"
                        checked={newApiKey.isGlobal}
                        onChange={(e) => setNewApiKey({...newApiKey, isGlobal: e.target.checked})}
                        className="rounded"
                      />
                      <label htmlFor="isGlobal" className="text-gray-300 text-sm">
                        Global anahtar (tüm kullanıcılar için)
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveApiKey}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {editingApiKey ? 'Güncelle' : 'Kaydet'}
                      </button>
                      <button
                        onClick={handleCloseApiKeyModal}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {adminActiveTab === 'tutorials' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">❓ Tutorial Yönetimi</h4>
              <button
                onClick={() => setActiveTab('profile')}
                id="settings-admin-back"
                data-registry="2.0.B.ADMIN_BACK"
                className="text-sm px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
                title="Profili Ayarlarına Dön"
              >
                ← Geri Dön
              </button>
            </div>
            <div className="bg-gray-700/40 rounded-xl p-4">
              <TutorialAdmin embedded />
            </div>
          </div>
        )}
        {adminActiveTab === 'updates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">🆕 Güncel Geliştirmeler</h4>
            </div>
            <div className="bg-gray-700/40 rounded-xl p-4">
              <UpdatesAdmin />
            </div>
          </div>
        )}

        {adminActiveTab === 'changelog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">📝 Changelog Yönetimi</h4>
              <button
                onClick={() => setShowChangelogModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + Yeni Changelog
              </button>
            </div>

            {/* Changelog List */}
            <div className="bg-gray-700/40 rounded-xl p-4">
              {isLoadingChangelogs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Changelog'lar yükleniyor...</p>
                </div>
              ) : changelogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Henüz changelog bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {changelogs.map((changelog) => (
                    <div key={changelog.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              changelog.type === 'feature' ? 'bg-green-500/20 text-green-400' :
                              changelog.type === 'bugfix' ? 'bg-red-500/20 text-red-400' :
                              changelog.type === 'improvement' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {changelog.type === 'feature' ? '✨ Özellik' :
                               changelog.type === 'bugfix' ? '🐛 Hata Düzeltmesi' :
                               changelog.type === 'improvement' ? '⚡ İyileştirme' :
                               '📝 Diğer'}
                            </span>
                            <span className="text-sm text-gray-400">v{changelog.version}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(changelog.releaseDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <h5 className="text-white font-medium mb-2">{changelog.title}</h5>
                          <p className="text-gray-300 text-sm line-clamp-2">{changelog.content}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditChangelog(changelog)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteChangelog(changelog.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Changelog Modal */}
            {showChangelogModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-white">
                      {editingChangelog ? 'Changelog Düzenle' : 'Yeni Changelog'}
                    </h5>
                    <button
                      onClick={handleCloseChangelogModal}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Başlık
                      </label>
                      <input
                        type="text"
                        value={newChangelog.title}
                        onChange={(e) => setNewChangelog({...newChangelog, title: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        placeholder="Changelog başlığı..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Tür
                        </label>
                        <select
                          value={newChangelog.type}
                          onChange={(e) => setNewChangelog({...newChangelog, type: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="feature">✨ Özellik</option>
                          <option value="bugfix">🐛 Hata Düzeltmesi</option>
                          <option value="improvement">⚡ İyileştirme</option>
                          <option value="other">📝 Diğer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Sürüm
                        </label>
                        <input
                          type="text"
                          value={newChangelog.version}
                          onChange={(e) => setNewChangelog({...newChangelog, version: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                          placeholder="1.0.0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        İçerik (Markdown desteklenir)
                      </label>
                      <textarea
                        value={newChangelog.content}
                        onChange={(e) => setNewChangelog({...newChangelog, content: e.target.value})}
                        rows={8}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                        placeholder="Changelog içeriği... Markdown formatında yazabilirsiniz."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Yayınlanma Tarihi
                      </label>
                      <input
                        type="date"
                        value={newChangelog.releaseDate}
                        onChange={(e) => setNewChangelog({...newChangelog, releaseDate: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSaveChangelog}
                      disabled={changelogOperationStatus === 'loading'}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      {changelogOperationStatus === 'loading' ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button
                      onClick={handleCloseChangelogModal}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {adminActiveTab === 'r2-storage' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">☁️ R2 Depolama Yönetimi</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Aktif</span>
              </div>
            </div>

            {/* R2 Configuration Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 rounded-lg p-6">
                <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                  <span className="text-lg">🔧</span>
                  Yapılandırma Durumu
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Account ID:</span>
                    <span className="text-green-400 font-mono text-sm">✓ Yapılandırıldı</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Access Key:</span>
                    <span className="text-green-400 font-mono text-sm">✓ Yapılandırıldı</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Secret Key:</span>
                    <span className="text-green-400 font-mono text-sm">✓ Yapılandırıldı</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Bucket Name:</span>
                    <span className="text-white font-mono text-sm">
                      {r2ConnectionStatus?.data?.bucketName || 'jun-oro-storage'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Public URL:</span>
                    <span className="text-blue-400 font-mono text-sm truncate">
                      {r2ConnectionStatus?.data?.publicUrl || 'https://pub-*.r2.dev'}
                    </span>
                  </div>
                  {r2ConnectionStatus && (
                    <div className={`mt-4 p-3 rounded ${
                      r2ConnectionStatus.success 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-red-500/20 border border-red-500/30'
                    }`}>
                      <div className={`text-sm ${
                        r2ConnectionStatus.success ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {r2ConnectionStatus.message}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-6">
                <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  Depolama İstatistikleri
                  {isLoadingR2Stats && (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin ml-2"></div>
                  )}
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Toplam Dosya:</span>
                    <span className="text-white font-mono">
                      {r2Stats ? r2Stats.totalFiles.toLocaleString() : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Kullanılan Alan:</span>
                    <span className="text-white font-mono">
                      {r2Stats ? r2Stats.totalSizeFormatted : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Son Yükleme:</span>
                    <span className="text-gray-400 text-sm">
                      {r2Stats && r2Stats.recentFiles.length > 0 
                        ? new Date(r2Stats.recentFiles[0].lastModified).toLocaleDateString('tr-TR')
                        : '-'
                      }
                    </span>
                  </div>
                  {r2Stats && r2Stats.fileTypes && Object.keys(r2Stats.fileTypes).length > 0 && (
                    <div className="mt-4 p-3 bg-gray-600/30 rounded">
                      <div className="text-sm text-gray-300 mb-2">Dosya Türleri:</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(r2Stats.fileTypes).map(([type, count]) => (
                          <span key={type} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                            {type.toUpperCase()}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-600/30 rounded">
                    💡 İstatistikler R2 API'sinden gerçek zamanlı olarak alınıyor
                  </div>
                </div>
              </div>
            </div>

            {/* R2 Operations */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                <span className="text-lg">⚡</span>
                Hızlı İşlemler
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={testR2Connection}
                  disabled={isTestingR2Connection}
                  className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {isTestingR2Connection ? '⏳' : '🧪'}
                  </div>
                  <div className="text-white font-medium">
                    {isTestingR2Connection ? 'Test Ediliyor...' : 'Bağlantı Testi'}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">R2 bağlantısını test et</div>
                </button>
                
                <button 
                  onClick={loadR2Stats}
                  disabled={isLoadingR2Stats}
                  className="p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {isLoadingR2Stats ? '⏳' : '🔄'}
                  </div>
                  <div className="text-white font-medium">
                    {isLoadingR2Stats ? 'Yenileniyor...' : 'İstatistikleri Yenile'}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Depolama verilerini güncelle</div>
                </button>
                
                <button className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-left transition-colors group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔄</div>
                  <div className="text-white font-medium">Cache Temizle</div>
                  <div className="text-sm text-gray-400 mt-1">R2 cache'ini temizle</div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                <span className="text-lg">📋</span>
                Son Aktiviteler
              </h5>
              <div className="space-y-3">
                {r2Stats?.recentFiles && r2Stats.recentFiles.length > 0 ? (
                  r2Stats.recentFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-600/30 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-white text-sm flex items-center gap-2">
                          <span>📄</span>
                          {file.key}
                        </div>
                        <div className="text-gray-400 text-xs flex items-center gap-4">
                          <span>Boyut: {file.size}</span>
                          <span>Son değişiklik: {new Date(file.lastModified).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    {isLoadingR2Stats ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span>Aktiviteler yükleniyor...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl mb-2">📁</div>
                        <p className="text-sm">Henüz R2 aktivitesi bulunmuyor</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Admin paneli için özel layout
  if (activeTab === 'admin' && isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
        <HeaderComponent />
        
        <main className="flex-1 p-6">
      <div className="max-w-[108rem] mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Ayarlar</h1>
              <p className="text-gray-400">Hesap ayarlarınızı ve tercihlerinizi yönetin</p>
            </div>

            <div className="flex gap-6">
              {/* Settings Sidebar - Admin Alt Kategoriler */}
              <div 
                className={`bg-gray-800/50 rounded-xl p-4 transition-all duration-300 ${
                  isAdminSidebarExpanded ? 'w-64' : 'w-16'
                }`} 
                id="settings-admin-nav" 
                data-registry="2.0.L.ADMIN_NAV"
              >
                {/* Sidebar Toggle Button */}
                <div className="flex items-center justify-between mb-4">
                  {isAdminSidebarExpanded && (
                    <h3 className="text-white font-semibold text-sm">Admin Panel</h3>
                  )}
                  <button
                    onClick={() => setIsAdminSidebarExpanded(!isAdminSidebarExpanded)}
                    className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-colors"
                    title={isAdminSidebarExpanded ? 'Sidebar\'ı Daralt' : 'Sidebar\'ı Genişlet'}
                  >
                    {isAdminSidebarExpanded ? '◀' : '▶'}
                  </button>
                </div>

                <nav className="space-y-4">
                  {adminNavGroups.map(group => (
                    <div key={group.id} className="space-y-2">
                      {/* Grup Başlığı - Tıklanabilir */}
                      <button 
                        onClick={() => isAdminSidebarExpanded && toggleCategory(group.id)}
                        className={`w-full text-gray-300 text-sm font-semibold flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-700/30 transition-colors ${
                          !isAdminSidebarExpanded ? 'justify-center' : 'justify-between'
                        }`} 
                        id={`settings-admin-group-${group.id}`} 
                        data-registry={`2.0.L.ADMIN_NAV.${group.id}`}
                        title={!isAdminSidebarExpanded ? group.name : ''}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{group.icon}</span>
                          {isAdminSidebarExpanded && <span>{group.name}</span>}
                        </div>
                        {isAdminSidebarExpanded && (
                          <span className="text-xs text-gray-400">
                            {expandedCategories[group.id] ? '▼' : '▶'}
                          </span>
                        )}
                      </button>
                      
                      {/* Grup Öğeleri - Sadece genişletilmişse göster */}
                      {expandedCategories[group.id] && (
                        <div className="space-y-1 ml-2">
                          {group.items.map(item => (
                            <button
                              key={item.id}
                              onClick={() => setAdminActiveTab(item.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                                adminActiveTab === item.id
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                              } ${!isAdminSidebarExpanded ? 'justify-center' : ''}`}
                              id={`settings-admin-item-${item.id}`}
                              data-registry={`2.0.L.ADMIN_NAV.${group.id}.${item.id}`}
                              title={!isAdminSidebarExpanded ? item.name : ''}
                            >
                              <span className="text-lg">{item.icon}</span>
                              {isAdminSidebarExpanded && (
                                <span className="text-sm font-medium">{item.name}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Admin Panel Content */}
              <div className="flex-1">
                {renderAdminPanel()}
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <HeaderComponent />
      
      <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Ayarlar</h1>
              <p className="text-gray-400">Hesap ayarlarınızı ve tercihlerinizi yönetin</p>
            </div>

            <div className="flex gap-6">
              {/* Settings Sidebar */}
              <div className="w-64 bg-gray-800/50 rounded-xl p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1">
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'preferences' && (
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Tercihler</h3>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⚙️</div>
                      <h4 className="text-2xl font-bold text-white mb-2">Çok Yakında!</h4>
                      <p className="text-gray-400 mb-4">Kişisel tercihlerinizi yönetebileceğiniz gelişmiş ayarlar paneli geliştiriliyor.</p>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-blue-400 text-sm">
                          🎮 Oyun tercihleri<br/>
                          🎨 Tema ayarları<br/>
                          🌍 Dil seçenekleri<br/>
                          📊 Görünüm ayarları
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'notifications' && (
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Bildirimler</h3>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔔</div>
                      <h4 className="text-2xl font-bold text-white mb-2">Çok Yakında!</h4>
                      <p className="text-gray-400 mb-4">Bildirim tercihlerinizi özelleştirebileceğiniz detaylı kontrol paneli hazırlanıyor.</p>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-yellow-400 text-sm">
                          📱 Push bildirimleri<br/>
                          📧 Email bildirimleri<br/>
                          🎮 Oyun bildirimleri<br/>
                          💰 İndirim uyarıları
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'privacy' && (
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Gizlilik</h3>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔒</div>
                      <h4 className="text-2xl font-bold text-white mb-2">Çok Yakında!</h4>
                      <p className="text-gray-400 mb-4">Gizlilik ve güvenlik ayarlarınızı yönetebileceğiniz kapsamlı panel geliştiriliyor.</p>
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-green-400 text-sm">
                          🔐 İki faktörlü doğrulama<br/>
                          👁️ Profil görünürlüğü<br/>
                          📊 Veri paylaşımı<br/>
                          🛡️ Güvenlik logları
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        {/* Kullanıcı Düzenleme Modalı */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {selectedUser.id === null ? 'Yeni Kullanıcı Ekle' : 'Kullanıcı Düzenle'}
                </h3>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    value={selectedUser.username}
                    onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Şifre alanı - yeni kullanıcı için zorunlu, düzenleme için opsiyonel */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Şifre {selectedUser.id === null && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="password"
                    value={selectedUser.password || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, password: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder={selectedUser.id === null ? "Kullanıcı şifresi (zorunlu)" : "Yeni şifre (boş bırakılırsa değişmez)"}
                    required={selectedUser.id === null}
                  />
                  {selectedUser.id !== null && (
                    <p className="text-xs text-gray-400 mt-1">
                      Şifreyi değiştirmek istemiyorsanız boş bırakın
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Ad
                  </label>
                  <input
                    type="text"
                    value={selectedUser.profile?.firstName || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser, 
                      profile: {...selectedUser.profile, firstName: e.target.value}
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Soyad
                  </label>
                  <input
                    type="text"
                    value={selectedUser.profile?.lastName || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser, 
                      profile: {...selectedUser.profile, lastName: e.target.value}
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Rol
                  </label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="user">Kullanıcı</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Durum
                  </label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="pending">Beklemede</option>
                    <option value="inactive">Pasif</option>
                    <option value="banned">Yasaklı</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={async () => {
                    try {
                      if (selectedUser.id === null) {
                        // Yeni kullanıcı ekleme işlemi
                        const userData = {
                          name: selectedUser.profile?.firstName && selectedUser.profile?.lastName 
                            ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`.trim()
                            : selectedUser.username || 'Yeni Kullanıcı',
                          username: selectedUser.username,
                          email: selectedUser.email,
                          password: selectedUser.password,
                          role: selectedUser.role
                        };

                        const response = await fetch('http://localhost:5000/api/users', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(userData),
                        });

                        const result = await response.json();

                        if (result.success) {
                          // Kullanıcı listesini yenile
                          const usersResponse = await fetch('http://localhost:5000/api/users');
                          const usersData = await usersResponse.json();
                          if (usersData.success) {
                            setUsers(usersData.data);
                          }
                          alert('Kullanıcı başarıyla oluşturuldu!');
                        } else {
                          alert(result.message || 'Kullanıcı oluşturulurken hata oluştu');
                        }
                      } else {
                        // Mevcut kullanıcı güncelleme işlemi
                        const userData = {
                          name: selectedUser.profile?.firstName && selectedUser.profile?.lastName 
                            ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`.trim()
                            : selectedUser.username || selectedUser.name,
                          username: selectedUser.username,
                          email: selectedUser.email,
                          role: selectedUser.role
                        };

                        // Şifre değiştirilmişse ekle
                        if (selectedUser.password && selectedUser.password.trim() !== '') {
                          userData.password = selectedUser.password;
                        }

                        const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(userData),
                        });

                        const result = await response.json();

                        if (result.success) {
                          // Kullanıcı listesini yenile
                          const usersResponse = await fetch('http://localhost:5000/api/users');
                          const usersData = await usersResponse.json();
                          if (usersData.success) {
                            setUsers(usersData.data);
                          }
                          alert('Kullanıcı başarıyla güncellendi!');
                        } else {
                          alert(result.message || 'Kullanıcı güncellenirken hata oluştu');
                        }
                      }
                      setShowUserModal(false);
                      setSelectedUser(null);
                    } catch (error) {
                      console.error('Kullanıcı işlemi hatası:', error);
                      alert('Beklenmeyen bir hata oluştu');
                    }
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {selectedUser.id === null ? 'Kullanıcı Ekle' : 'Güncelle'}
                </button>
                <button
                  onClick={() => {
                    setShowUserModal(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resim Kırpma Modalı */}
        {showImageCropper && selectedImageFile && (
          <ImageCropperModal
            imageUrl={selectedImageFile}
            onCropComplete={handleCropComplete}
            onCancel={() => setShowImageCropper(false)}
          />
        )}
        
        <SiteFooter />
        <ElementSelector />
    </div>
  )
}

// Basit Resim Kırpma Modalı Komponenti
function ImageCropperModal({ imageUrl, onCropComplete, onCancel }) {
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialCropArea, setInitialCropArea] = useState(null)

  const handleImageLoad = (e) => {
    const img = e.target
    const containerWidth = 400
    const containerHeight = 400
    const aspectRatio = img.naturalWidth / img.naturalHeight
    
    let displayWidth, displayHeight
    if (aspectRatio > 1) {
      displayWidth = containerWidth
      displayHeight = containerWidth / aspectRatio
    } else {
      displayHeight = containerHeight
      displayWidth = containerHeight * aspectRatio
    }
    
    setImageSize({ width: displayWidth, height: displayHeight })
    
    // Kırpma alanını ortala
    const size = Math.min(displayWidth, displayHeight) * 0.8
    setCropArea({
      x: (displayWidth - size) / 2,
      y: (displayHeight - size) / 2,
      width: size,
      height: size
    })
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y
    })
  }

  const handleResizeStart = (e, handle) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialCropArea({ ...cropArea })
  }

  const handleMouseMove = (e) => {
    if (isDragging && !isResizing) {
      const newX = Math.max(0, Math.min(imageSize.width - cropArea.width, e.clientX - dragStart.x))
      const newY = Math.max(0, Math.min(imageSize.height - cropArea.height, e.clientY - dragStart.y))
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }))
    } else if (isResizing && resizeHandle && initialCropArea) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      const minSize = 50
      const maxSize = Math.min(imageSize.width, imageSize.height)
      
      let newCropArea = { ...initialCropArea }
      
      switch (resizeHandle) {
        case 'se': // Güneydoğu (sağ alt)
          const newWidth = Math.max(minSize, Math.min(imageSize.width - initialCropArea.x, initialCropArea.width + deltaX))
          const newHeight = Math.max(minSize, Math.min(imageSize.height - initialCropArea.y, initialCropArea.height + deltaY))
          const size = Math.min(newWidth, newHeight, maxSize) // Kare şeklini koru ve sınırları kontrol et
          newCropArea.width = size
          newCropArea.height = size
          // Sınırları kontrol et
          if (newCropArea.x + newCropArea.width > imageSize.width) {
            newCropArea.width = imageSize.width - newCropArea.x
            newCropArea.height = newCropArea.width
          }
          if (newCropArea.y + newCropArea.height > imageSize.height) {
            newCropArea.height = imageSize.height - newCropArea.y
            newCropArea.width = newCropArea.height
          }
          break
        case 'sw': // Güneybatı (sol alt)
          const swNewWidth = Math.max(minSize, initialCropArea.width - deltaX)
          const swNewHeight = Math.max(minSize, Math.min(imageSize.height - initialCropArea.y, initialCropArea.height + deltaY))
          const swSize = Math.min(swNewWidth, swNewHeight, maxSize)
          newCropArea.width = swSize
          newCropArea.height = swSize
          newCropArea.x = Math.max(0, initialCropArea.x + initialCropArea.width - swSize)
          // Sınırları kontrol et
          if (newCropArea.y + newCropArea.height > imageSize.height) {
            newCropArea.height = imageSize.height - newCropArea.y
            newCropArea.width = newCropArea.height
            newCropArea.x = Math.max(0, initialCropArea.x + initialCropArea.width - newCropArea.width)
          }
          break
        case 'ne': // Kuzeydoğu (sağ üst)
          const neNewWidth = Math.max(minSize, Math.min(imageSize.width - initialCropArea.x, initialCropArea.width + deltaX))
          const neNewHeight = Math.max(minSize, initialCropArea.height - deltaY)
          const neSize = Math.min(neNewWidth, neNewHeight, maxSize)
          newCropArea.width = neSize
          newCropArea.height = neSize
          newCropArea.y = Math.max(0, initialCropArea.y + initialCropArea.height - neSize)
          // Sınırları kontrol et
          if (newCropArea.x + newCropArea.width > imageSize.width) {
            newCropArea.width = imageSize.width - newCropArea.x
            newCropArea.height = newCropArea.width
            newCropArea.y = Math.max(0, initialCropArea.y + initialCropArea.height - newCropArea.height)
          }
          break
        case 'nw': // Kuzeybatı (sol üst)
          const nwNewWidth = Math.max(minSize, initialCropArea.width - deltaX)
          const nwNewHeight = Math.max(minSize, initialCropArea.height - deltaY)
          const nwSize = Math.min(nwNewWidth, nwNewHeight, maxSize)
          newCropArea.width = nwSize
          newCropArea.height = nwSize
          newCropArea.x = Math.max(0, initialCropArea.x + initialCropArea.width - nwSize)
          newCropArea.y = Math.max(0, initialCropArea.y + initialCropArea.height - nwSize)
          break
      }
      
      // Final sınır kontrolü
      newCropArea.x = Math.max(0, Math.min(imageSize.width - newCropArea.width, newCropArea.x))
      newCropArea.y = Math.max(0, Math.min(imageSize.height - newCropArea.height, newCropArea.y))
      
      setCropArea(newCropArea)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
    setInitialCropArea(null)
  }

  const handleCrop = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const scaleX = img.naturalWidth / imageSize.width
      const scaleY = img.naturalHeight / imageSize.height
      
      canvas.width = 200
      canvas.height = 200
      
      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        200,
        200
      )
      
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9)
      onCropComplete(croppedImageUrl)
    }
    
    img.src = imageUrl
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Profil Resmini Kırp</h3>
        
        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4 flex items-center justify-center" style={{ height: '400px' }}>
          <div className="relative">
            <img
              src={imageUrl}
              alt="Kırpılacak resim"
              onLoad={handleImageLoad}
              className="max-w-full max-h-full object-contain"
              style={{ width: imageSize.width, height: imageSize.height }}
            />
            
            {/* Kırpma alanı */}
            <div
              className="absolute border-2 border-blue-500 bg-blue-500/20 cursor-move"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height
              }}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-0 border border-white/50"></div>
              
              {/* Resize Handle'ları */}
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize -top-1 -left-1"
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
              ></div>
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize -top-1 -right-1"
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
              ></div>
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize -bottom-1 -left-1"
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
              ></div>
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize -bottom-1 -right-1"
                onMouseDown={(e) => handleResizeStart(e, 'se')}
              ></div>
            </div>
            
            {/* Karartma overlay'leri */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none">
              <div
                className="absolute bg-transparent"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  boxShadow: `0 0 0 ${Math.max(imageSize.width, imageSize.height)}px rgba(0,0,0,0.5)`
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-400 text-sm mb-4">
          Mavi alanı sürükleyerek taşıyın, köşelerdeki noktaları sürükleyerek boyutlandırın
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleCrop}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Kırp ve Kaydet
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
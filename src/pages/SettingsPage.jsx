import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useHeaderComponent } from "../hooks/useHeaderComponent";
import igdbApi from "../services/igdbApi";
import { apiKeyService } from "../services/apiKeys";
import uploadService from "../services/uploadService";
import SiteFooter from "../components/SiteFooter";
import ElementSelector from "../components/Tutorial/ElementSelector";
import UpdatesAdmin from "../components/Updates/UpdatesAdmin";
import TutorialAdmin from "../components/Tutorial/TutorialAdmin";
import {
  AdminIntegrations,
  ProfileSettings,
  AdminNotifications,
} from "../components/Settings";
import AdminUsers from "../components/Settings/AdminUsers";
import UserModal from "../components/Settings/UserModal";
import AdminSidebar from "../components/Settings/AdminSidebar";
import useSettingsData from "../hooks/useSettingsData";

// API Base URL configuration
// const API_BASE_URL = import.meta.env.VITE_API_URL || "${API_BASE_URL}";

function SettingsPage() {
  const { user, isAdmin, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Hangi header'ın kullanılacağını belirle
  const HeaderComponent = useHeaderComponent();
  // Centralized settings data hook
  const settings = useSettingsData();

  // Sync hook-managed data into local state for backward-compatible incremental refactor
  useEffect(() => {
    // trigger initial loads handled by the hook internally, but ensure loadUsers is called on mount
    if (settings && typeof settings.loadUsers === "function") {
      settings.loadUsers();
      settings.loadNotificationHistory && settings.loadNotificationHistory();
    }
  }, [settings]);

  useEffect(() => {
    // Hook-managed data is the source of truth. Avoid syncing into local setters here
    // because some local setters are declared later in the file and calling them
    // from this early effect can cause ReferenceError during tests.
    // Keep this effect intentionally as a no-op that only tracks the hook's deps.
  }, [
    settings?.users,
    settings?.pendingUsers,
    settings?.notificationHistory,
    settings?.userReadStats,
  ]);

  const users = useMemo(() => settings?.users || [], [settings?.users]);
  const pendingUsers = useMemo(
    () => settings?.pendingUsers || [],
    [settings?.pendingUsers],
  );
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Users are loaded via the centralized useSettingsData hook

  // IGDB API state'leri
  const [igdbClientId, setIgdbClientId] = useState("");
  const [igdbAccessToken, setIgdbAccessToken] = useState("");
  const [apiStats, setApiStats] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // API Key Management state'leri (data comes from hook)
  const apiKeys = settings?.apiKeys || [];
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState(null);
  const [newApiKey, setNewApiKey] = useState({
    serviceName: "",
    keyName: "",
    keyValue: "",
    isGlobal: true,
    metadata: {},
  });
  const [apiKeyOperationStatus, setApiKeyOperationStatus] = useState(null);

  // Bildirim yönetimi state'leri
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("info");
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // R2 Depolama state'leri (core data from hook)
  const r2Stats = settings?.r2Stats || null;
  const [r2ConnectionStatus, setR2ConnectionStatus] = useState(null);
  const [isLoadingR2Stats, setIsLoadingR2Stats] = useState(false);
  const [isTestingR2Connection, setIsTestingR2Connection] = useState(false);
  const [sendToAll, setSendToAll] = useState(true);

  // Bildirim takip sistemi state'leri (data from hook)
  const notificationStats = settings?.notificationStats || {};
  const [userReadStats, setUserReadStats] = useState(
    settings?.userReadStats || {},
  );
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  // Trafik logları state'leri (data from hook)
  const trafficLogs = settings?.trafficLogs || [];
  const [trafficFilter, setTrafficFilter] = useState("all");
  const [trafficDateRange, setTrafficDateRange] = useState("today");

  // Admin denetim günlüğü state'leri (data from hook)
  const auditLogs = settings?.auditLogs || [];

  // Şifre gösterme state'i
  const [showPasswords, setShowPasswords] = useState({});

  // Admin sidebar expand/collapse state'i
  const [isAdminSidebarExpanded, setIsAdminSidebarExpanded] = useState(true);

  // Admin kategorileri expand/collapse state'i
  const [expandedCategories, setExpandedCategories] = useState({
    management: true,
    analytics: true,
    integrations: true,
  });
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [auditLogsFilter, setAuditLogsFilter] = useState("all");

  // Profil resmi state'leri
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Expandable liste state'leri
  const [expandedUserDetails, setExpandedUserDetails] = useState({});

  // Changelog yönetimi state'leri (list from hook; modals remain local)
  const changelogs = settings?.changelogs || [];
  const [isLoadingChangelogs] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [editingChangelog, setEditingChangelog] = useState(null);
  const [newChangelog, setNewChangelog] = useState({
    title: "",
    content: "",
    version: "",
    type: "update",
    isPublished: true, // Default olarak yayınlanmış
    releaseDate: new Date().toISOString().split("T")[0], // Today's date as default
  });
  const [changelogOperationStatus, setChangelogOperationStatus] =
    useState(null);

  const tabs = [
    { id: "profile", name: "Profil", icon: "👤" },
    { id: "preferences", name: "Tercihler", icon: "⚙️" },
    { id: "notifications", name: "Bildirimler", icon: "🔔" },
    { id: "privacy", name: "Gizlilik", icon: "🔒" },
    ...(isAdmin() ? [{ id: "admin", name: "Admin Panel", icon: "👑" }] : []),
  ];

  // Admin sol sidebar kategorileri ve alt öğeleri
  const adminNavGroups = [
    {
      id: "management",
      name: "Yönetim",
      icon: "🛠️",
      items: [
        { id: "users", name: "Kullanıcı Yönetimi", icon: "👥" },
        { id: "notifications", name: "Bildirim Yönetimi", icon: "📢" },
        { id: "tracking", name: "Bildirim Takip", icon: "📊" },
        { id: "tutorials", name: "Tutorial Yönetimi", icon: "❓" },
        { id: "changelog", name: "Changelog Yönetimi", icon: "📋" },
      ],
    },
    {
      id: "analytics",
      name: "Analitik & Loglar",
      icon: "📈",
      items: [
        { id: "traffic", name: "Trafik Logları", icon: "🚦" },
        { id: "api-logs", name: "API Logları", icon: "🧾" },
        { id: "audit-logs", name: "Admin Denetim Günlüğü", icon: "🛡️" },
      ],
    },
    {
      id: "integrations",
      name: "Entegrasyonlar",
      icon: "🔌",
      items: [
        { id: "api-keys", name: "API Anahtar Yönetimi", icon: "🔑" },
        { id: "api", name: "API Merkezi", icon: "🔌" },
        { id: "r2-storage", name: "R2 Depolama Yönetimi", icon: "☁️" },
        { id: "updates", name: "Güncel Geliştirmeler", icon: "🆕" },
      ],
    },
  ];

  const [adminActiveTab, setAdminActiveTab] = useState("users");

  // Load admin-related data via centralized hook when admin tab changes
  useEffect(() => {
    if (!settings) return;
    if (isAdmin()) {
      try {
        // keep local apiStats in sync with igdbApi
        setApiStats(igdbApi.getApiStats());
      } catch (e) {
        // ignore
      }
      if (adminActiveTab === "tracking") {
        // notification stats calculation remains local but data comes from hook
        loadNotificationStats && loadNotificationStats();
      }
      if (adminActiveTab === "traffic") {
        settings.loadTrafficLogs && settings.loadTrafficLogs();
      }
      if (adminActiveTab === "api-keys") {
        settings.loadApiKeys && settings.loadApiKeys();
      }
      if (adminActiveTab === "changelog") {
        settings.loadChangelogs && settings.loadChangelogs();
      }
      if (adminActiveTab === "audit-logs") {
        settings.loadAuditLogs && settings.loadAuditLogs();
      }
      if (adminActiveTab === "r2-storage") {
        settings.loadR2Stats && settings.loadR2Stats();
      }
    }
  }, [adminActiveTab, isAdmin, settings, loadNotificationStats]);

  // Notification history is managed by useSettingsData hook (loadNotificationHistory called inside the hook)

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find((user) => user.id === userId);

    if (userToDelete && userToDelete.role === "admin") {
      alert(
        "⚠️ ADMIN KORUMA SİSTEMİ\n\nAdmin hesapları güvenlik nedeniyle silinemez!",
      );
      return;
    }

    if (!window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?"))
      return;

    try {
      const res = await settings.deleteUser(userId);
      if (res && res.success) {
        // hook yüklemeyi tetiklemiş olmalı; ekstra çağrı güvenlik için
        settings.loadUsers && settings.loadUsers();
        alert("Kullanıcı başarıyla silindi");
      } else {
        const err = res?.error || res?.data || {};
        alert(err.message || err.error || "Kullanıcı silinirken hata oluştu");
      }
    } catch (err) {
      console.error("Kullanıcı silme hatası (wrapper):", err);
      alert("Kullanıcı silinirken beklenmeyen bir hata oluştu");
    }
  };

  const handleEditUser = (user) => {
    // Backend'den gelen veriyi frontend modalının beklediği formata dönüştür
    const editableUser = {
      id: user.id,
      username: user.username || "",
      email: user.email || "",
      password: "", // Düzenleme sırasında şifre boş başlar
      role: user.role || "user",
      status: user.status || "offline",
      avatar: user.profileImage || "",
      profile: {
        firstName: user.name ? user.name.split(" ")[0] : "",
        lastName: user.name ? user.name.split(" ").slice(1).join(" ") : "",
        bio: user.bio || "",
        profileImage: user.profileImage || null,
      },
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString().split("T")[0]
        : "",
      lastLogin: user.lastActive
        ? new Date(user.lastActive).toLocaleDateString("tr-TR")
        : "Henüz giriş yapmadı",
    };
    setSelectedUser(editableUser);
    setShowUserModal(true);
  };

  const handleAddNewUser = () => {
    // Yeni kullanıcı için boş template oluştur
    const newUserTemplate = {
      id: null, // Yeni kullanıcı olduğunu belirtmek için null
      username: "",
      email: "",
      password: "",
      role: "user",
      status: "offline",
      avatar: "",
      profile: {
        firstName: "",
        lastName: "",
        bio: "",
        profileImage: null,
      },
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: "Henüz giriş yapmadı",
    };
    setSelectedUser(newUserTemplate);
    setShowUserModal(true);
  };

  // Save selected user (create or update) - delegated to hook
  const handleSaveSelectedUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await settings.saveUser(selectedUser);
      if (res && res.success) {
        settings.loadUsers && settings.loadUsers();
        alert(
          selectedUser.id
            ? "Kullanıcı başarıyla güncellendi!"
            : "Kullanıcı başarıyla oluşturuldu!",
        );
        setShowUserModal(false);
        setSelectedUser(null);
      } else {
        const err = res?.error || res?.data || {};
        alert(
          err.message || err.error || "Kullanıcı kaydedilirken hata oluştu",
        );
      }
    } catch (err) {
      console.error("Kullanıcı kaydetme hatası (wrapper):", err);
      alert("Beklenmeyen bir hata oluştu");
    }
  };

  // Pending kullanıcıyı onayla - delegated to hook
  const handleApproveUser = async (userId) => {
    try {
      const res = await settings.approveUser(userId);
      if (res && res.success) {
        settings.loadUsers && settings.loadUsers();
        alert("Kullanıcı başarıyla onaylandı!");
      } else {
        const err = res?.error || {};
        alert(err.message || "Kullanıcı onaylanırken hata oluştu");
      }
    } catch (err) {
      console.error("Kullanıcı onaylama hatası (wrapper):", err);
      alert("Kullanıcı onaylanırken hata oluştu");
    }
  };

  // Pending kullanıcıyı reddet - delegated to hook
  const handleRejectUser = async (userId) => {
    if (
      !confirm(
        "Bu kullanıcıyı reddetmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      )
    ) {
      return;
    }
    try {
      const res = await settings.rejectUser(userId);
      if (res && res.success) {
        settings.loadUsers && settings.loadUsers();
        alert("Kullanıcı başarıyla reddedildi!");
      } else {
        const err = res?.error || {};
        alert(err.message || "Kullanıcı reddedilirken hata oluştu");
      }
    } catch (err) {
      console.error("Kullanıcı reddetme hatası (wrapper):", err);
      alert("Kullanıcı reddedilirken hata oluştu");
    }
  };

  // Şifre gösterme/gizleme fonksiyonu
  const togglePasswordVisibility = (userId) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Kategori genişletme/daraltma fonksiyonu
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // IGDB API fonksiyonları
  const handleSaveApiCredentials = async () => {
    if (!igdbClientId.trim() || !igdbAccessToken.trim()) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }

    try {
      // Database'e kaydet
      await apiKeyService.setIgdbCredentials(
        igdbClientId.trim(),
        igdbAccessToken.trim(),
      );
      setConnectionStatus({
        success: true,
        message: "API anahtarları database'e kaydedildi",
      });

      // İstatistikleri güncelle
      setApiStats(igdbApi.getApiStats());
    } catch (error) {
      console.error("Failed to save IGDB credentials:", error);
      setConnectionStatus({
        success: false,
        message: "API anahtarları kaydedilemedi: " + error.message,
      });
    }
  };

  const handleTestConnection = async () => {
    if (!igdbClientId.trim() || !igdbAccessToken.trim()) {
      alert("Lütfen önce API anahtarlarını kaydedin");
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      const result = await igdbApi.testConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({ success: false, message: error.message });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleClearCredentials = async () => {
    if (
      window.confirm("API anahtarlarını silmek istediğinizden emin misiniz?")
    ) {
      try {
        await igdbApi.clearCredentials();
        setIgdbClientId("");
        setIgdbAccessToken("");
        setConnectionStatus(null);
        setApiStats(igdbApi.getApiStats());
      } catch (error) {
        console.error("Failed to clear IGDB credentials:", error);
        alert("API anahtarları silinirken hata oluştu: " + error.message);
      }
    }
  };

  // Steam API fonksiyonları
  // Supabase API state'leri

  // API Key Management fonksiyonları
  const loadApiKeys = async () => {
    setIsLoadingApiKeys(true);
    try {
      const response = await apiKeyService.getApiKeys();
      // API keys are managed by the hook, this function is for compatibility
      if (settings && settings.loadApiKeys) {
        settings.loadApiKeys();
      }
    } catch (error) {
      console.error("Failed to load API keys:", error);
      setApiKeyOperationStatus({
        success: false,
        message: "API anahtarları yüklenirken hata oluştu: " + error.message,
      });
    } finally {
      setIsLoadingApiKeys(false);
    }
  };

  // R2 Depolama fonksiyonları
  const loadR2Stats = async () => {
    setIsLoadingR2Stats(true);
    try {
      // R2 stats are managed by the hook
      if (settings && settings.loadR2Stats) {
        settings.loadR2Stats();
      }
    } catch (error) {
      console.error("R2 istatistikleri yüklenirken hata:", error);
    } finally {
      setIsLoadingR2Stats(false);
    }
  };

  const testR2Connection = async () => {
    setIsTestingR2Connection(true);
    try {
      const res = await settings.testR2Connection();
      if (res && res.success) {
        setR2ConnectionStatus({
          success: true,
          message: "R2 bağlantısı başarılı!",
          data: res.data,
        });
      } else {
        setR2ConnectionStatus({
          success: false,
          message: res?.message || res?.error || "R2 bağlantı testi başarısız",
        });
      }
    } catch (err) {
      console.error("R2 bağlantı testi hatası (wrapper):", err);
      setR2ConnectionStatus({
        success: false,
        message: "R2 bağlantı testi sırasında hata oluştu: " + err.message,
      });
    } finally {
      setIsTestingR2Connection(false);
    }
  };

  // R2 verilerini sayfa yüklendiğinde çek
  useEffect(() => {
    if (activeTab === "admin") {
      loadR2Stats();
    }
  }, [activeTab]);

  const handleSaveApiKey = async () => {
    if (
      !newApiKey.serviceName.trim() ||
      !newApiKey.keyName.trim() ||
      !newApiKey.keyValue.trim()
    ) {
      alert("Servis adı, anahtar adı ve değer alanları zorunludur!");
      return;
    }

    try {
      if (editingApiKey) {
        await apiKeyService.updateKey(editingApiKey.id, {
          serviceName: newApiKey.serviceName,
          keyName: newApiKey.keyName,
          keyValue: newApiKey.keyValue,
          isGlobal: newApiKey.isGlobal,
          metadata: newApiKey.metadata,
        });
        setApiKeyOperationStatus({
          success: true,
          message: "API anahtarı başarıyla güncellendi!",
        });
      } else {
        await apiKeyService.saveKey(
          newApiKey.serviceName,
          newApiKey.keyName,
          newApiKey.keyValue,
          newApiKey.isGlobal,
          newApiKey.metadata,
        );
        setApiKeyOperationStatus({
          success: true,
          message: "API anahtarı başarıyla kaydedildi!",
        });
      }

      // Modal'ı kapat ve formu temizle
      setShowApiKeyModal(false);
      setEditingApiKey(null);
      setNewApiKey({
        serviceName: "",
        keyName: "",
        keyValue: "",
        isGlobal: true,
        metadata: {},
      });

      // API anahtarlarını yeniden yükle
      await loadApiKeys();
    } catch (error) {
      console.error("Failed to save API key:", error);

      // 409 conflict hatası için özel mesaj
      if (error.response?.status === 409) {
        setApiKeyOperationStatus({
          success: false,
          message: `${newApiKey.serviceName} servisi için zaten bir API anahtarı mevcut. Mevcut anahtarı düzenlemek için listeden seçin.`,
        });
      } else {
        setApiKeyOperationStatus({
          success: false,
          message:
            "API anahtarı kaydedilirken hata oluştu: " +
            (error.response?.data?.error || error.message),
        });
      }
    }
  };

  const handleEditApiKey = (apiKey) => {
    setEditingApiKey(apiKey);
    setNewApiKey({
      serviceName: apiKey.serviceName,
      keyName: apiKey.keyName,
      keyValue: apiKey.keyValue,
      isGlobal: apiKey.isGlobal,
      metadata: apiKey.metadata || {},
    });
    setShowApiKeyModal(true);
  };

  const handleDeleteApiKey = async (keyId) => {
    if (
      window.confirm("Bu API anahtarını silmek istediğinizden emin misiniz?")
    ) {
      try {
        await apiKeyService.deleteKey(keyId);
        setApiKeyOperationStatus({
          success: true,
          message: "API anahtarı başarıyla silindi!",
        });
        await loadApiKeys();
      } catch (error) {
        console.error("Failed to delete API key:", error);
        setApiKeyOperationStatus({
          success: false,
          message: "API anahtarı silinirken hata oluştu: " + error.message,
        });
      }
    }
  };

  const handleCloseApiKeyModal = () => {
    setShowApiKeyModal(false);
    setEditingApiKey(null);
    setNewApiKey({
      serviceName: "",
      keyName: "",
      keyValue: "",
      isGlobal: true,
      metadata: {},
    });
  };

  // Bildirim gönderme fonksiyonları - delegated to hook
  const handleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  // Changelog yönetimi fonksiyonları - delegated to hook
  // Admin denetim günlüğü fonksiyonları
  const loadAuditLogs = async () => {
    setIsLoadingAuditLogs(true);
    try {
      // Audit logs are managed by the hook
      if (settings && settings.loadAuditLogs) {
        settings.loadAuditLogs();
      }
    } catch (error) {
      console.error("Denetim günlüğü yükleme hatası:", error);
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  const getFilteredAuditLogs = () => {
    if (auditLogsFilter === "all") return auditLogs;
    return auditLogs.filter((log) =>
      log.action.toLowerCase().includes(auditLogsFilter.toLowerCase()),
    );
  };

  const formatAuditLogAction = (action) => {
    const actionMap = {
      CREATE_USER: "👤 Kullanıcı Oluşturma",
      UPDATE_USER: "✏️ Kullanıcı Güncelleme",
      DELETE_USER: "🗑️ Kullanıcı Silme",
      LOGIN: "🔐 Giriş",
      LOGOUT: "🚪 Çıkış",
      CREATE_CHANGELOG: "📝 Changelog Oluşturma",
      UPDATE_CHANGELOG: "📝 Changelog Güncelleme",
      DELETE_CHANGELOG: "🗑️ Changelog Silme",
    };
    return actionMap[action] || action;
  };

  const handleSaveChangelog = async () => {
    if (!newChangelog.title.trim() || !newChangelog.content.trim()) {
      setChangelogOperationStatus({
        type: "error",
        message: "Başlık ve içerik alanları zorunludur!",
      });
      return;
    }
    setChangelogOperationStatus(null);
    try {
      const res = await settings.saveChangelog(
        { ...newChangelog, authorId: user.id },
        editingChangelog?.id || null,
      );
      if (res && res.success) {
        setChangelogOperationStatus({
          type: "success",
          message: editingChangelog
            ? "Changelog başarıyla güncellendi!"
            : "Changelog başarıyla oluşturuldu!",
        });
        handleCloseChangelogModal();
      } else {
        setChangelogOperationStatus({
          type: "error",
          message: res?.error || "Changelog kaydedilemedi",
        });
      }
    } catch (err) {
      console.error("Changelog kaydetme hatası (wrapper):", err);
      setChangelogOperationStatus({
        type: "error",
        message: "Changelog kaydedilemedi",
      });
    }
  };

  const handleDeleteChangelog = async (changelogId) => {
    if (!confirm("Bu changelog'u silmek istediğinizden emin misiniz?")) {
      return;
    }
    try {
      const res = await settings.deleteChangelog(changelogId);
      if (res && res.success) {
        setChangelogOperationStatus({
          type: "success",
          message: "Changelog başarıyla silindi!",
        });
        // hook will update changelogs
      } else {
        setChangelogOperationStatus({
          type: "error",
          message: res?.error || "Changelog silinemedi",
        });
      }
    } catch (err) {
      console.error("Changelog silme hatası (wrapper):", err);
      setChangelogOperationStatus({
        type: "error",
        message: "Changelog silinemedi",
      });
    }
  };

  const handleEditChangelog = (changelog) => {
    setEditingChangelog(changelog);
    setNewChangelog({
      title: changelog.title,
      content: changelog.content,
      version: changelog.version || "",
      type: changelog.type,
      isPublished: changelog.isPublished,
      releaseDate: changelog.releaseDate
        ? new Date(changelog.releaseDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setShowChangelogModal(true);
  };

  const handleCloseChangelogModal = () => {
    setShowChangelogModal(false);
    setEditingChangelog(null);
    setNewChangelog({
      title: "",
      content: "",
      version: "",
      type: "update",
      isPublished: true, // Default olarak yayınlanmış
      releaseDate: new Date().toISOString().split("T")[0],
    });
    setChangelogOperationStatus(null);
  };

  // Bildirim takip fonksiyonları
  const loadNotificationStats = useCallback(() => {
    try {
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]",
      );
      const stats = {};

      notifications.forEach((notification) => {
        const readCount = users.reduce((count, user) => {
          const userReadStatus = JSON.parse(
            localStorage.getItem(`notificationReadStatus_${user.id}`) || "{}",
          );
          return count + (userReadStatus[notification.id] ? 1 : 0);
        }, 0);

        stats[notification.id] = {
          ...notification,
          totalUsers: users.length,
          readCount,
          unreadCount: users.length - readCount,
          readPercentage:
            users.length > 0 ? Math.round((readCount / users.length) * 100) : 0,
        };
      });

      // Notification stats are managed by the hook
      if (settings && settings.setNotificationStats) {
        settings.setNotificationStats(stats);
      }
    } catch (error) {
      console.error("Bildirim istatistikleri yüklenirken hata:", error);
    }
  }, [users, settings]);

  const loadUserReadStats = (notificationId) => {
    try {
      const userStats = {};

      users.forEach((user) => {
        const userReadStatus = JSON.parse(
          localStorage.getItem(`notificationReadStatus_${user.id}`) || "{}",
        );
        userStats[user.id] = {
          ...user,
          hasRead: !!userReadStatus[notificationId],
          readAt: userReadStatus[`${notificationId}_readAt`] || null,
        };
      });

      setUserReadStats(userStats);
    } catch (error) {
      console.error("Kullanıcı okuma istatistikleri yüklenirken hata:", error);
    }
  };

  // Trafik logları fonksiyonları
  const loadTrafficLogs = () => {
    // Traffic logs are managed by the hook
    if (settings && settings.loadTrafficLogs) {
      settings.loadTrafficLogs();
    }
  };

  const getFilteredTrafficLogs = () => {
    let filtered = trafficLogs;

    // Aksiyon filtreleme
    if (trafficFilter !== "all") {
      filtered = filtered.filter((log) => log.action === trafficFilter);
    }

    // Tarih filtreleme
    const now = new Date();
    if (trafficDateRange === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter((log) => new Date(log.timestamp) >= today);
    } else if (trafficDateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= weekAgo);
    } else if (trafficDateRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= monthAgo);
    }

    return filtered;
  };

  const getActionDisplayName = (action) => {
    const actionNames = {
      login: "Giriş",
      logout: "Çıkış",
      page_view: "Sayfa Görüntüleme",
      game_add: "Oyun Ekleme",
      game_remove: "Oyun Silme",
      search: "Arama",
      profile_update: "Profil Güncelleme",
    };
    return actionNames[action] || action;
  };

  // Profil resmi yükleme fonksiyonları
  const handleAvatarUpload = async (formData) => {
    try {
      setIsUploadingAvatar(true);

      // Add user ID to form data
      formData.append("userId", user.id);

      // Upload to R2 via backend
      const result = await uploadService.uploadAvatar(formData);

      if (result.success) {
        // Update local state
        setProfileImage(result.data.url);

        // Update user context with new profile image
        const updatedUser = {
          ...user,
          profileImage: result.data.url,
        };
        updateUser(updatedUser);

        console.log("Avatar başarıyla yüklendi:", result.data.url);
      }
    } catch (error) {
      console.error("Avatar yükleme hatası:", error);
      alert("Avatar yükleme sırasında hata oluştu: " + error.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsUploadingAvatar(true);

      const result = await uploadService.deleteAvatar(user.id);

      if (result.success) {
        // Update local state
        setProfileImage(null);

        // Update user context
        const updatedUser = {
          ...user,
          profileImage: null,
        };
        updateUser(updatedUser);

        console.log("Avatar başarıyla silindi");
      }
    } catch (error) {
      console.error("Avatar silme hatası:", error);
      alert("Avatar silme sırasında hata oluştu: " + error.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Legacy functions - keeping for backward compatibility
  const handleCropComplete = (croppedImage) => {
    setProfileImage(croppedImage);
    setShowImageCropper(false);
    saveProfileImage(croppedImage);
  };

  const saveProfileImage = (imageData) => {
    try {
      // LocalStorage'a profil resmini kaydet
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          profileImage: imageData,
        },
      };
      updateUser(updatedUser);

      // Başarı mesajı göster (isteğe bağlı)
      console.log("Profil resmi başarıyla kaydedildi");
    } catch (error) {
      console.error("Profil resmi kaydetme hatası:", error);
    }
  };

  const getActionIcon = (action) => {
    const actionIcons = {
      login: "🔓",
      logout: "🔒",
      page_view: "👁️",
      game_add: "➕",
      game_remove: "➖",
      search: "🔍",
      profile_update: "✏️",
    };
    return actionIcons[action] || "📝";
  };

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
              <span className="text-white font-bold text-xl">
                {user?.username?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="text-white font-bold text-lg">{user?.username}</div>
            <div className="text-blue-300">{user?.email}</div>
            <div className="text-gray-400 text-sm">
              Rol: {user?.role === "admin" ? "👑 Admin" : "👤 Kullanıcı"}
            </div>
            <div className="text-gray-400 text-sm">
              User ID:{" "}
              <span className="font-mono text-blue-300">{user?.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          👑 Admin Panel
        </h3>
        {/* İçerik - sol sidebar seçimlerine göre */}
        {adminActiveTab === "users" && (
          <div>
            <AdminUsers
              users={users}
              pendingUsers={pendingUsers}
              onApproveUser={handleApproveUser}
              onRejectUser={handleRejectUser}
              onEditUser={handleEditUser}
              onAddNewUser={handleAddNewUser}
              onDeleteUser={handleDeleteUser}
              loadUserSecurity={settings?.loadUserSecurity}
              expandedUserDetails={expandedUserDetails}
              toggleDetail={(userId, type) => {
                const key = `${userId}_${type}`;
                const isExpanding = !expandedUserDetails[key];
                setExpandedUserDetails((prev) => ({
                  ...prev,
                  [key]: isExpanding,
                }));
                if (
                  isExpanding &&
                  type === "security" &&
                  !users.find((u) => u.id === userId)?.security
                ) {
                  settings.loadUserSecurity &&
                    settings.loadUserSecurity(userId);
                }
              }}
              showPasswords={showPasswords}
              togglePasswordVisibility={togglePasswordVisibility}
            />
          </div>
        )}

        {adminActiveTab === "notifications" && (
          <AdminNotifications
            notificationTitle={notificationTitle}
            notificationMessage={notificationMessage}
            notificationType={notificationType}
            setNotificationTitle={setNotificationTitle}
            setNotificationMessage={setNotificationMessage}
            setNotificationType={setNotificationType}
            sendToAll={sendToAll}
            setSendToAll={setSendToAll}
            selectedUsers={selectedUsers}
            onUserSelection={handleUserSelection}
            onSelectAllUsers={handleSelectAllUsers}
            isSendingNotification={isSendingNotification}
            onSendNotification={async () => {
              setIsSendingNotification(true);
              try {
                await settings.sendNotification({
                  title: notificationTitle,
                  message: notificationMessage,
                  type: notificationType,
                  recipients: sendToAll ? "all" : selectedUsers,
                });
                settings.loadNotificationHistory &&
                  settings.loadNotificationHistory();
                // reset form
                setNotificationTitle("");
                setNotificationMessage("");
                setNotificationType("info");
                setSendToAll(true);
                setSelectedUsers([]);
                alert("Bildirim başarıyla gönderildi!");
              } catch (err) {
                console.error("sendNotification wrapper error", err);
                alert("Bildirim gönderilirken bir hata oluştu!");
              } finally {
                setIsSendingNotification(false);
              }
            }}
            notificationHistory={
              settings?.notificationHistory || notificationHistory
            }
            users={users}
            setSelectedNotificationId={setSelectedNotificationId}
            loadUserReadStats={settings?.loadUserReadStats || loadUserReadStats}
            userReadStats={settings?.userReadStats || userReadStats}
            selectedNotificationId={selectedNotificationId}
          />
        )}

        {adminActiveTab === "audit-logs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                🔍 Admin Denetim Günlüğü
              </h4>
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
                  <p className="text-gray-400 mt-2">
                    Denetim günlükleri yükleniyor...
                  </p>
                </div>
              ) : getFilteredAuditLogs().length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    Henüz denetim günlüğü bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredAuditLogs().map((log) => (
                    <div
                      key={log.id}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">
                              {formatAuditLogAction(log.action)}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                log.success
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {log.success ? "✅ Başarılı" : "❌ Başarısız"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Admin:</span>
                              <span className="text-white ml-2">
                                {log.admin?.username || "Bilinmiyor"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Tarih:</span>
                              <span className="text-white ml-2">
                                {new Date(log.createdAt).toLocaleString(
                                  "tr-TR",
                                )}
                              </span>
                            </div>
                            {log.targetType && (
                              <div>
                                <span className="text-gray-400">Hedef:</span>
                                <span className="text-white ml-2">
                                  {log.targetType}
                                </span>
                                {log.targetName && (
                                  <span className="text-gray-300 ml-1">
                                    ({log.targetName})
                                  </span>
                                )}
                              </div>
                            )}
                            <div>
                              <span className="text-gray-400">IP:</span>
                              <span className="text-white ml-2">
                                {log.ipAddress || "Bilinmiyor"}
                              </span>
                            </div>
                          </div>

                          {log.details && (
                            <div className="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                              <span className="text-gray-400 text-sm">
                                Detaylar:
                              </span>
                              <pre className="text-gray-300 text-xs mt-1 whitespace-pre-wrap">
                                {typeof log.details === "string"
                                  ? log.details
                                  : JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}

                          {!log.success && log.errorMessage && (
                            <div className="mt-3 p-3 bg-red-900/20 rounded border border-red-700">
                              <span className="text-red-400 text-sm">
                                Hata:
                              </span>
                              <p className="text-red-300 text-sm mt-1">
                                {log.errorMessage}
                              </p>
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
                    Sayfa {auditLogsPagination.currentPage} /{" "}
                    {auditLogsPagination.totalPages}(
                    {auditLogsPagination.totalItems} kayıt)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAuditLogsPage(auditLogsPage - 1);
                        loadAuditLogs();
                      }}
                      disabled={auditLogsPage <= 1}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded text-sm transition-colors"
                    >
                      ← Önceki
                    </button>
                    <button
                      onClick={() => {
                        setAuditLogsPage(auditLogsPage + 1);
                        loadAuditLogs();
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

        {adminActiveTab === "api-logs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                📊 API Logları
              </h4>
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
                    <div className="text-2xl font-bold text-blue-400">
                      {apiStats.last30Days.total}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Toplam İstek (30 gün)
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {apiStats.last30Days.total > 0
                        ? Math.round(
                            (apiStats.last30Days.successful /
                              apiStats.last30Days.total) *
                              100,
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-gray-400 text-sm">Başarı Oranı</div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {apiStats.last30Days.failed}
                    </div>
                    <div className="text-gray-400 text-sm">Başarısız İstek</div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {apiStats.last30Days.avgResponseTime}ms
                    </div>
                    <div className="text-gray-400 text-sm">
                      Ort. Yanıt Süresi
                    </div>
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
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Zaman
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Endpoint
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Durum
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Yanıt Süresi
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Hata
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {igdbApi
                      .getApiLogs()
                      .slice(-50)
                      .reverse()
                      .map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-gray-700/50 hover:bg-gray-600/20"
                        >
                          <td className="py-3 px-4 text-gray-300 text-sm">
                            {new Date(log.timestamp).toLocaleString("tr-TR")}
                          </td>
                          <td className="py-3 px-4 text-white font-medium">
                            /{log.endpoint}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                log.success
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {log.success ? "✅ Başarılı" : "❌ Başarısız"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-yellow-400 font-medium">
                            {log.responseTime}ms
                          </td>
                          <td className="py-3 px-4 text-red-400 text-sm">
                            {log.error || "-"}
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
                    Loglar otomatik olarak 30 gün sonra silinir. Manuel
                    temizleme için butonu kullanabilirsiniz.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Toplam log sayısı: {igdbApi.getApiLogs().length}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Tüm API loglarını silmek istediğinizden emin misiniz?",
                      )
                    ) {
                      localStorage.removeItem("igdb_api_logs");
                      setApiStats(igdbApi.getApiStats());
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

        {adminActiveTab === "tracking" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                📊 Bildirim Takip Sistemi
              </h4>
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
                  <div className="text-2xl font-bold text-blue-400">
                    {Object.keys(notificationStats).length}
                  </div>
                  <div className="text-gray-400 text-sm">Toplam Bildirim</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {Object.keys(notificationStats).length > 0
                      ? Math.round(
                          Object.values(notificationStats).reduce(
                            (sum, stat) => sum + stat.readPercentage,
                            0,
                          ) / Object.keys(notificationStats).length,
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-gray-400 text-sm">Ortalama Okunma</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {users.length}
                  </div>
                  <div className="text-gray-400 text-sm">Aktif Kullanıcı</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {Object.values(notificationStats).reduce(
                      (sum, stat) => sum + stat.unreadCount,
                      0,
                    )}
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
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Bildirim
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Tip
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Gönderilme
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Okunma Oranı
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(notificationStats).map((stat) => (
                      <tr
                        key={stat.id}
                        className="border-b border-gray-700/50 hover:bg-gray-600/20"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-white font-medium">
                              {stat.title}
                            </div>
                            <div className="text-gray-400 text-sm truncate max-w-xs">
                              {stat.message}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              stat.type === "info"
                                ? "bg-blue-500/20 text-blue-400"
                                : stat.type === "success"
                                  ? "bg-green-500/20 text-green-400"
                                  : stat.type === "warning"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : stat.type === "error"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            {stat.type === "info" && "ℹ️ Bilgi"}
                            {stat.type === "success" && "✅ Başarı"}
                            {stat.type === "warning" && "⚠️ Uyarı"}
                            {stat.type === "error" && "❌ Hata"}
                            {stat.type === "announcement" && "📢 Duyuru"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {new Date(stat.timestamp).toLocaleString("tr-TR")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  stat.readPercentage >= 80
                                    ? "bg-green-500"
                                    : stat.readPercentage >= 50
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
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
                              setSelectedNotificationId(stat.id);
                              loadUserReadStats(stat.id);
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
                    Henüz bildirim bulunmuyor. İstatistikleri yüklemek için
                    "Yenile" butonuna tıklayın.
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
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">
                          Kullanıcı
                        </th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">
                          Durum
                        </th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">
                          Okunma Zamanı
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(userReadStats).map((userStat) => (
                        <tr
                          key={userStat.id}
                          className="border-b border-gray-700/50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {userStat.avatar}
                                </span>
                              </div>
                              <div>
                                <div className="text-white font-medium">
                                  {userStat.username}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {userStat.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                userStat.hasRead
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {userStat.hasRead ? "✅ Okundu" : "❌ Okunmadı"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300 text-sm">
                            {userStat.readAt
                              ? new Date(userStat.readAt).toLocaleString(
                                  "tr-TR",
                                )
                              : "-"}
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
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Kullanıcı
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Toplam Bildirim
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Okunan
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Okunmayan
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Okunma Oranı
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const userReadStatus = JSON.parse(
                        localStorage.getItem(
                          `notificationReadStatus_${user.id}`,
                        ) || "{}",
                      );
                      const totalNotifications =
                        Object.keys(notificationStats).length;
                      const readCount = Object.keys(notificationStats).filter(
                        (notificationId) => userReadStatus[notificationId],
                      ).length;
                      const unreadCount = totalNotifications - readCount;
                      const readPercentage =
                        totalNotifications > 0
                          ? Math.round((readCount / totalNotifications) * 100)
                          : 0;

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-gray-700/50 hover:bg-gray-600/20"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {user.avatar}
                                </span>
                              </div>
                              <div>
                                <div className="text-white font-medium">
                                  {user.username}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-blue-400 font-medium">
                              {totalNotifications}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-green-400 font-medium">
                              {readCount}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-red-400 font-medium">
                              {unreadCount}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-600 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    readPercentage >= 80
                                      ? "bg-green-500"
                                      : readPercentage >= 50
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
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
                      );
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

        {adminActiveTab === "traffic" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                🚦 Trafik Logları
              </h4>
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
                  <div className="text-2xl font-bold text-blue-400">
                    {getFilteredTrafficLogs().length}
                  </div>
                  <div className="text-gray-400 text-sm">Toplam Aktivite</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {
                      new Set(getFilteredTrafficLogs().map((log) => log.userId))
                        .size
                    }
                  </div>
                  <div className="text-gray-400 text-sm">Aktif Kullanıcı</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {
                      getFilteredTrafficLogs().filter(
                        (log) => log.action === "login",
                      ).length
                    }
                  </div>
                  <div className="text-gray-400 text-sm">Giriş Sayısı</div>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.round(
                      getFilteredTrafficLogs().reduce(
                        (sum, log) => sum + log.duration,
                        0,
                      ) / getFilteredTrafficLogs().length,
                    ) || 0}
                    s
                  </div>
                  <div className="text-gray-400 text-sm">
                    Ort. Oturum Süresi
                  </div>
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
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Zaman
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Kullanıcı
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Aksiyon
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Sayfa
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        IP Adresi
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Tarayıcı
                      </th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">
                        Süre
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTrafficLogs()
                      .slice(0, 50)
                      .map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-gray-700/50 hover:bg-gray-600/20"
                        >
                          <td className="py-3 px-4 text-gray-300 text-sm">
                            {new Date(log.timestamp).toLocaleString("tr-TR")}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">
                                  {log.username[0].toUpperCase()}
                                </span>
                              </div>
                              <span className="text-white font-medium">
                                {log.username}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {getActionIcon(log.action)}
                              </span>
                              <span className="text-white">
                                {getActionDisplayName(log.action)}
                              </span>
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
                    Toplam {getFilteredTrafficLogs().length} kayıt bulundu, ilk
                    50 tanesi gösteriliyor.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {adminActiveTab === "api" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                🔌 API Yönetim Merkezi
              </h4>
              <div className="flex items-center gap-2">
                {connectionStatus && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      connectionStatus.success
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {connectionStatus.success
                      ? "✅ Bağlı"
                      : "❌ Bağlantı Hatası"}
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
                        placeholder={
                          igdbClientId
                            ? "IGDB Client ID'nizi girin"
                            : "🔍 Key bulunamadı - IGDB Client ID'nizi girin"
                        }
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
                        placeholder={
                          igdbAccessToken
                            ? "IGDB Access Token'ınızı girin"
                            : "🔍 Key bulunamadı - IGDB Access Token'ınızı girin"
                        }
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
                        {isTestingConnection
                          ? "⏳ Test Ediliyor..."
                          : "🔍 Bağlantıyı Test Et"}
                      </button>
                      <button
                        onClick={handleClearCredentials}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        🗑️ Temizle
                      </button>
                    </div>

                    {connectionStatus && (
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          connectionStatus.success
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
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
                        <h6 className="text-gray-300 text-sm font-medium mb-3">
                          📅 Bugün
                        </h6>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Toplam:
                            </span>
                            <span className="text-white font-medium">
                              {apiStats.today.total}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Başarılı:
                            </span>
                            <span className="text-green-400 font-medium">
                              {apiStats.today.successful}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Başarısız:
                            </span>
                            <span className="text-red-400 font-medium">
                              {apiStats.today.failed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Ort. Yanıt:
                            </span>
                            <span className="text-yellow-400 font-medium">
                              {apiStats.today.avgResponseTime}ms
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Son 7 Gün */}
                      <div className="bg-gray-600/30 rounded-lg p-4">
                        <h6 className="text-gray-300 text-sm font-medium mb-3">
                          📈 Son 7 Gün
                        </h6>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Toplam:
                            </span>
                            <span className="text-white font-medium">
                              {apiStats.last7Days.total}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Başarılı:
                            </span>
                            <span className="text-green-400 font-medium">
                              {apiStats.last7Days.successful}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Başarısız:
                            </span>
                            <span className="text-red-400 font-medium">
                              {apiStats.last7Days.failed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Ort. Yanıt:
                            </span>
                            <span className="text-yellow-400 font-medium">
                              {apiStats.last7Days.avgResponseTime}ms
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Son 30 Gün */}
                      <div className="bg-gray-600/30 rounded-lg p-4">
                        <h6 className="text-gray-300 text-sm font-medium mb-3">
                          📊 Son 30 Gün
                        </h6>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Toplam:
                            </span>
                            <span className="text-white font-medium">
                              {apiStats.last30Days.total}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Başarılı:
                            </span>
                            <span className="text-green-400 font-medium">
                              {apiStats.last30Days.successful}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Başarısız:
                            </span>
                            <span className="text-red-400 font-medium">
                              {apiStats.last30Days.failed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">
                              Ort. Yanıt:
                            </span>
                            <span className="text-yellow-400 font-medium">
                              {apiStats.last30Days.avgResponseTime}ms
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Endpoint İstatistikleri */}
                    {Object.keys(apiStats.endpoints).length > 0 && (
                      <div className="mt-6">
                        <h6 className="text-gray-300 text-sm font-medium mb-3">
                          🎯 Endpoint İstatistikleri
                        </h6>
                        <div className="space-y-2">
                          {Object.entries(apiStats.endpoints).map(
                            ([endpoint, stats]) => (
                              <div
                                key={endpoint}
                                className="bg-gray-600/20 rounded-lg p-3"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-white font-medium">
                                    /{endpoint}
                                  </span>
                                  <div className="flex gap-4 text-xs">
                                    <span className="text-gray-400">
                                      Toplam: {stats.total}
                                    </span>
                                    <span className="text-green-400">
                                      ✓ {stats.successful}
                                    </span>
                                    <span className="text-red-400">
                                      ✗ {stats.failed}
                                    </span>
                                    <span className="text-yellow-400">
                                      {stats.avgResponseTime}ms
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Steam API Yönetimi */}
                <AdminIntegrations />

                {/* Supabase API Yönetimi — Kaldırıldı */}
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
                      <h6 className="text-blue-400 font-medium mb-2">
                        1. Twitch Developer Console
                      </h6>
                      <p>
                        <a
                          href="https://dev.twitch.tv/console"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          https://dev.twitch.tv/console
                        </a>{" "}
                        adresine gidin ve yeni bir uygulama oluşturun.
                      </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h6 className="text-green-400 font-medium mb-2">
                        2. Client ID
                      </h6>
                      <p>
                        Oluşturduğunuz uygulamanın Client ID'sini kopyalayın.
                      </p>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <h6 className="text-yellow-400 font-medium mb-2">
                        3. Access Token
                      </h6>
                      <p>
                        OAuth2 Client Credentials flow kullanarak access token
                        alın:
                      </p>
                      <code className="block mt-2 p-2 bg-gray-800 rounded text-xs">
                        POST https://id.twitch.tv/oauth2/token
                        <br />
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
                      <h6 className="text-blue-400 font-medium mb-2">
                        1. Steam Developer Portal
                      </h6>
                      <p>
                        <a
                          href="https://steamcommunity.com/dev/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          https://steamcommunity.com/dev/apikey
                        </a>{" "}
                        adresine gidin ve Steam hesabınızla giriş yapın.
                      </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h6 className="text-green-400 font-medium mb-2">
                        2. API Key Oluşturma
                      </h6>
                      <p>
                        Domain Name alanına herhangi bir domain yazabilirsiniz
                        (örn: localhost). API anahtarınızı kopyalayın.
                      </p>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <h6 className="text-yellow-400 font-medium mb-2">
                        3. Kullanım
                      </h6>
                      <p>
                        Steam API ile oyun bilgileri, kullanıcı kütüphaneleri ve
                        başarımlar gibi verilere erişebilirsiniz.
                      </p>
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
                      <h6 className="text-blue-400 font-medium mb-2">
                        1. Supabase Dashboard
                      </h6>
                      <p>
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          https://supabase.com/dashboard
                        </a>{" "}
                        adresine gidin ve projenizi seçin.
                      </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h6 className="text-green-400 font-medium mb-2">
                        2. API Anahtarları
                      </h6>
                      <p>
                        Settings → API kısmından Project URL ve anon public API
                        anahtarınızı kopyalayın.
                      </p>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <h6 className="text-yellow-400 font-medium mb-2">
                        3. Kullanım
                      </h6>
                      <p>
                        Supabase ile veritabanı işlemleri, authentication ve
                        real-time özellikler kullanabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {adminActiveTab === "api-keys" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                🔑 API Anahtar Yönetimi
              </h4>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Yeni API Anahtarı
              </button>
            </div>

            {/* Status Message */}
            {apiKeyOperationStatus && (
              <div
                className={`p-4 rounded-lg text-sm ${
                  apiKeyOperationStatus.success
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {apiKeyOperationStatus.message}
              </div>
            )}

            {/* API Keys List */}
            <div className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-white font-medium">
                  Kayıtlı API Anahtarları
                </h5>
                {isLoadingApiKeys && (
                  <div className="text-gray-400 text-sm">Yükleniyor...</div>
                )}
              </div>

              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🔑</div>
                  <p>Henüz kayıtlı API anahtarı bulunmuyor.</p>
                  <p className="text-sm mt-1">
                    Yeni bir API anahtarı eklemek için yukarıdaki butonu
                    kullanın.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="bg-gray-600/50 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h6 className="text-white font-medium">
                              {apiKey.serviceName}
                            </h6>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-300">
                              {apiKey.keyName}
                            </span>
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
                            Oluşturulma:{" "}
                            {new Date(apiKey.createdAt).toLocaleString("tr-TR")}
                            {apiKey.updatedAt !== apiKey.createdAt && (
                              <span>
                                {" "}
                                • Güncelleme:{" "}
                                {new Date(apiKey.updatedAt).toLocaleString(
                                  "tr-TR",
                                )}
                              </span>
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
                      {editingApiKey
                        ? "API Anahtarını Düzenle"
                        : "Yeni API Anahtarı Ekle"}
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
                        onChange={(e) =>
                          setNewApiKey({
                            ...newApiKey,
                            serviceName: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setNewApiKey({
                            ...newApiKey,
                            keyName: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setNewApiKey({
                            ...newApiKey,
                            keyValue: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setNewApiKey({
                            ...newApiKey,
                            isGlobal: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <label
                        htmlFor="isGlobal"
                        className="text-gray-300 text-sm"
                      >
                        Global anahtar (tüm kullanıcılar için)
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveApiKey}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {editingApiKey ? "Güncelle" : "Kaydet"}
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

        {adminActiveTab === "tutorials" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                ❓ Tutorial Yönetimi
              </h4>
              <button
                onClick={() => setActiveTab("profile")}
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
        {adminActiveTab === "updates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                🆕 Güncel Geliştirmeler
              </h4>
            </div>
            <div className="bg-gray-700/40 rounded-xl p-4">
              <UpdatesAdmin />
            </div>
          </div>
        )}

        {adminActiveTab === "changelog" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                📝 Changelog Yönetimi
              </h4>
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
                  <p className="text-gray-400 mt-2">
                    Changelog'lar yükleniyor...
                  </p>
                </div>
              ) : changelogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Henüz changelog bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {changelogs.map((changelog) => (
                    <div
                      key={changelog.id}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                changelog.type === "feature"
                                  ? "bg-green-500/20 text-green-400"
                                  : changelog.type === "bugfix"
                                    ? "bg-red-500/20 text-red-400"
                                    : changelog.type === "improvement"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {changelog.type === "feature"
                                ? "✨ Özellik"
                                : changelog.type === "bugfix"
                                  ? "🐛 Hata Düzeltmesi"
                                  : changelog.type === "improvement"
                                    ? "⚡ İyileştirme"
                                    : "📝 Diğer"}
                            </span>
                            <span className="text-sm text-gray-400">
                              v{changelog.version}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(
                                changelog.releaseDate,
                              ).toLocaleDateString("tr-TR")}
                            </span>
                          </div>
                          <h5 className="text-white font-medium mb-2">
                            {changelog.title}
                          </h5>
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {changelog.content}
                          </p>
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
                      {editingChangelog
                        ? "Changelog Düzenle"
                        : "Yeni Changelog"}
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
                        onChange={(e) =>
                          setNewChangelog({
                            ...newChangelog,
                            title: e.target.value,
                          })
                        }
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
                          onChange={(e) =>
                            setNewChangelog({
                              ...newChangelog,
                              type: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setNewChangelog({
                              ...newChangelog,
                              version: e.target.value,
                            })
                          }
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
                        onChange={(e) =>
                          setNewChangelog({
                            ...newChangelog,
                            content: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setNewChangelog({
                            ...newChangelog,
                            releaseDate: e.target.value,
                          })
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSaveChangelog}
                      disabled={changelogOperationStatus === "loading"}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      {changelogOperationStatus === "loading"
                        ? "Kaydediliyor..."
                        : "Kaydet"}
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

        {adminActiveTab === "r2-storage" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">
                ☁️ R2 Depolama Yönetimi
              </h4>
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
                    <span className="text-green-400 font-mono text-sm">
                      ✓ Yapılandırıldı
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Access Key:</span>
                    <span className="text-green-400 font-mono text-sm">
                      ✓ Yapılandırıldı
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Secret Key:</span>
                    <span className="text-green-400 font-mono text-sm">
                      ✓ Yapılandırıldı
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Bucket Name:</span>
                    <span className="text-white font-mono text-sm">
                      {r2ConnectionStatus?.data?.bucketName ||
                        "jun-oro-storage"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Public URL:</span>
                    <span className="text-blue-400 font-mono text-sm truncate">
                      {r2ConnectionStatus?.data?.publicUrl ||
                        "https://pub-*.r2.dev"}
                    </span>
                  </div>
                  {r2ConnectionStatus && (
                    <div
                      className={`mt-4 p-3 rounded ${
                        r2ConnectionStatus.success
                          ? "bg-green-500/20 border border-green-500/30"
                          : "bg-red-500/20 border border-red-500/30"
                      }`}
                    >
                      <div
                        className={`text-sm ${
                          r2ConnectionStatus.success
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                      >
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
                      {r2Stats ? r2Stats.totalFiles.toLocaleString() : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Kullanılan Alan:</span>
                    <span className="text-white font-mono">
                      {r2Stats ? r2Stats.totalSizeFormatted : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Son Yükleme:</span>
                    <span className="text-gray-400 text-sm">
                      {r2Stats && r2Stats.recentFiles.length > 0
                        ? new Date(
                            r2Stats.recentFiles[0].lastModified,
                          ).toLocaleDateString("tr-TR")
                        : "-"}
                    </span>
                  </div>
                  {r2Stats &&
                    r2Stats.fileTypes &&
                    Object.keys(r2Stats.fileTypes).length > 0 && (
                      <div className="mt-4 p-3 bg-gray-600/30 rounded">
                        <div className="text-sm text-gray-300 mb-2">
                          Dosya Türleri:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(r2Stats.fileTypes).map(
                            ([type, count]) => (
                              <span
                                key={type}
                                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                              >
                                {type.toUpperCase()}: {count}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-600/30 rounded">
                    💡 İstatistikler R2 API'sinden gerçek zamanlı olarak
                    alınıyor
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
                    {isTestingR2Connection ? "⏳" : "🧪"}
                  </div>
                  <div className="text-white font-medium">
                    {isTestingR2Connection
                      ? "Test Ediliyor..."
                      : "Bağlantı Testi"}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    R2 bağlantısını test et
                  </div>
                </button>

                <button
                  onClick={loadR2Stats}
                  disabled={isLoadingR2Stats}
                  className="p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {isLoadingR2Stats ? "⏳" : "🔄"}
                  </div>
                  <div className="text-white font-medium">
                    {isLoadingR2Stats
                      ? "Yenileniyor..."
                      : "İstatistikleri Yenile"}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Depolama verilerini güncelle
                  </div>
                </button>

                <button className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-left transition-colors group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    🔄
                  </div>
                  <div className="text-white font-medium">Cache Temizle</div>
                  <div className="text-sm text-gray-400 mt-1">
                    R2 cache'ini temizle
                  </div>
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
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-600/30 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-white text-sm flex items-center gap-2">
                          <span>📄</span>
                          {file.key}
                        </div>
                        <div className="text-gray-400 text-xs flex items-center gap-4">
                          <span>Boyut: {file.size}</span>
                          <span>
                            Son değişiklik:{" "}
                            {new Date(file.lastModified).toLocaleDateString(
                              "tr-TR",
                            )}
                          </span>
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
                        <p className="text-sm">
                          Henüz R2 aktivitesi bulunmuyor
                        </p>
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
  );

  // Admin paneli için özel layout
  if (activeTab === "admin" && isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
        <HeaderComponent />

        <main className="flex-1 p-6">
          <div className="max-w-[108rem] mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Ayarlar</h1>
              <p className="text-gray-400">
                Hesap ayarlarınızı ve tercihlerinizi yönetin
              </p>
            </div>

            <div className="flex gap-6">
              {/* Admin sidebar extracted to component */}
              <AdminSidebar
                adminNavGroups={adminNavGroups}
                adminActiveTab={adminActiveTab}
                setAdminActiveTab={setAdminActiveTab}
                isAdminSidebarExpanded={isAdminSidebarExpanded}
                toggleSidebar={() => setIsAdminSidebarExpanded((prev) => !prev)}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
              />

              {/* Admin Panel Content */}
              <div className="flex-1">{renderAdminPanel()}</div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <HeaderComponent />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Ayarlar</h1>
            <p className="text-gray-400">
              Hesap ayarlarınızı ve tercihlerinizi yönetin
            </p>
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
                        ? "bg-blue-500 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
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
              {activeTab === "profile" && (
                <ProfileSettings
                  profileImage={profileImage}
                  isUploading={isUploadingAvatar}
                  onUpload={handleAvatarUpload}
                  onDeleteAvatar={handleDeleteAvatar}
                />
              )}
              {activeTab === "preferences" && (
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Tercihler
                  </h3>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⚙️</div>
                    <h4 className="text-2xl font-bold text-white mb-2">
                      Çok Yakında!
                    </h4>
                    <p className="text-gray-400 mb-4">
                      Kişisel tercihlerinizi yönetebileceğiniz gelişmiş ayarlar
                      paneli geliştiriliyor.
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-blue-400 text-sm">
                        🎮 Oyun tercihleri
                        <br />
                        🎨 Tema ayarları
                        <br />
                        🌍 Dil seçenekleri
                        <br />
                        📊 Görünüm ayarları
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "notifications" && (
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Bildirimler
                  </h3>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔔</div>
                    <h4 className="text-2xl font-bold text-white mb-2">
                      Çok Yakında!
                    </h4>
                    <p className="text-gray-400 mb-4">
                      Bildirim tercihlerinizi özelleştirebileceğiniz detaylı
                      kontrol paneli hazırlanıyor.
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-yellow-400 text-sm">
                        📱 Push bildirimleri
                        <br />
                        📧 Email bildirimleri
                        <br />
                        🎮 Oyun bildirimleri
                        <br />
                        💰 İndirim uyarıları
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "privacy" && (
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Gizlilik
                  </h3>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔒</div>
                    <h4 className="text-2xl font-bold text-white mb-2">
                      Çok Yakında!
                    </h4>
                    <p className="text-gray-400 mb-4">
                      Gizlilik ve güvenlik ayarlarınızı yönetebileceğiniz
                      kapsamlı panel geliştiriliyor.
                    </p>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-green-400 text-sm">
                        🔐 İki faktörlü doğrulama
                        <br />
                        👁️ Profil görünürlüğü
                        <br />
                        📊 Veri paylaşımı
                        <br />
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
        <UserModal
          user={selectedUser}
          onChange={setSelectedUser}
          onSave={handleSaveSelectedUser}
          onCancel={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
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
  );
}

// Basit Resim Kırpma Modalı Komponenti
function ImageCropperModal({ imageUrl, onCropComplete, onCancel }) {
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCropArea, setInitialCropArea] = useState(null);

  const handleImageLoad = (e) => {
    const img = e.target;
    const containerWidth = 400;
    const containerHeight = 400;
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    let displayWidth, displayHeight;
    if (aspectRatio > 1) {
      displayWidth = containerWidth;
      displayHeight = containerWidth / aspectRatio;
    } else {
      displayHeight = containerHeight;
      displayWidth = containerHeight * aspectRatio;
    }

    setImageSize({ width: displayWidth, height: displayHeight });

    // Kırpma alanını ortala
    const size = Math.min(displayWidth, displayHeight) * 0.8;
    setCropArea({
      x: (displayWidth - size) / 2,
      y: (displayHeight - size) / 2,
      width: size,
      height: size,
    });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y,
    });
  };

  const handleResizeStart = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialCropArea({ ...cropArea });
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isResizing) {
      const newX = Math.max(
        0,
        Math.min(imageSize.width - cropArea.width, e.clientX - dragStart.x),
      );
      const newY = Math.max(
        0,
        Math.min(imageSize.height - cropArea.height, e.clientY - dragStart.y),
      );

      setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing && resizeHandle && initialCropArea) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const minSize = 50;
      const maxSize = Math.min(imageSize.width, imageSize.height);

      let newCropArea = { ...initialCropArea };

      switch (resizeHandle) {
        case "se": {
          // Güneydoğu (sağ alt)
          const newWidth = Math.max(
            minSize,
            Math.min(
              imageSize.width - initialCropArea.x,
              initialCropArea.width + deltaX,
            ),
          );
          const newHeight = Math.max(
            minSize,
            Math.min(
              imageSize.height - initialCropArea.y,
              initialCropArea.height + deltaY,
            ),
          );
          const size = Math.min(newWidth, newHeight, maxSize); // Kare şeklini koru ve sınırları kontrol et
          newCropArea.width = size;
          newCropArea.height = size;
          // Sınırları kontrol et
          if (newCropArea.x + newCropArea.width > imageSize.width) {
            newCropArea.width = imageSize.width - newCropArea.x;
            newCropArea.height = newCropArea.width;
          }
          if (newCropArea.y + newCropArea.height > imageSize.height) {
            newCropArea.height = imageSize.height - newCropArea.y;
            newCropArea.width = newCropArea.height;
          }
          break;
        }
        case "sw": {
          // Güneybatı (sol alt)
          const swNewWidth = Math.max(minSize, initialCropArea.width - deltaX);
          const swNewHeight = Math.max(
            minSize,
            Math.min(
              imageSize.height - initialCropArea.y,
              initialCropArea.height + deltaY,
            ),
          );
          const swSize = Math.min(swNewWidth, swNewHeight, maxSize);
          newCropArea.width = swSize;
          newCropArea.height = swSize;
          newCropArea.x = Math.max(
            0,
            initialCropArea.x + initialCropArea.width - swSize,
          );
          // Sınırları kontrol et
          if (newCropArea.y + newCropArea.height > imageSize.height) {
            newCropArea.height = imageSize.height - newCropArea.y;
            newCropArea.width = newCropArea.height;
            newCropArea.x = Math.max(
              0,
              initialCropArea.x + initialCropArea.width - newCropArea.width,
            );
          }
          break;
        }
        case "ne": {
          // Kuzeydoğu (sağ üst)
          const neNewWidth = Math.max(
            minSize,
            Math.min(
              imageSize.width - initialCropArea.x,
              initialCropArea.width + deltaX,
            ),
          );
          const neNewHeight = Math.max(
            minSize,
            initialCropArea.height - deltaY,
          );
          const neSize = Math.min(neNewWidth, neNewHeight, maxSize);
          newCropArea.width = neSize;
          newCropArea.height = neSize;
          newCropArea.y = Math.max(
            0,
            initialCropArea.y + initialCropArea.height - neSize,
          );
          // Sınırları kontrol et
          if (newCropArea.x + newCropArea.width > imageSize.width) {
            newCropArea.width = imageSize.width - newCropArea.x;
            newCropArea.height = newCropArea.width;
            newCropArea.y = Math.max(
              0,
              initialCropArea.y + initialCropArea.height - newCropArea.height,
            );
          }
          break;
        }
        case "nw": {
          // Kuzeybatı (sol üst)
          const nwNewWidth = Math.max(minSize, initialCropArea.width - deltaX);
          const nwNewHeight = Math.max(
            minSize,
            initialCropArea.height - deltaY,
          );
          const nwSize = Math.min(nwNewWidth, nwNewHeight, maxSize);
          newCropArea.width = nwSize;
          newCropArea.height = nwSize;
          newCropArea.x = Math.max(
            0,
            initialCropArea.x + initialCropArea.width - nwSize,
          );
          newCropArea.y = Math.max(
            0,
            initialCropArea.y + initialCropArea.height - nwSize,
          );
          break;
        }
      }

      // Final sınır kontrolü
      newCropArea.x = Math.max(
        0,
        Math.min(imageSize.width - newCropArea.width, newCropArea.x),
      );
      newCropArea.y = Math.max(
        0,
        Math.min(imageSize.height - newCropArea.height, newCropArea.y),
      );

      setCropArea(newCropArea);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setInitialCropArea(null);
  };

  const handleCrop = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const scaleX = img.naturalWidth / imageSize.width;
      const scaleY = img.naturalHeight / imageSize.height;

      canvas.width = 200;
      canvas.height = 200;

      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        200,
        200,
      );

      const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.9);
      onCropComplete(croppedImageUrl);
    };

    img.src = imageUrl;
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
        <h3 className="text-xl font-bold text-white mb-4">
          Profil Resmini Kırp
        </h3>

        <div
          className="relative bg-gray-900 rounded-lg overflow-hidden mb-4 flex items-center justify-center"
          style={{ height: "400px" }}
        >
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
                height: cropArea.height,
              }}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-0 border border-white/50"></div>

              {/* Resize Handle'ları */}
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize -top-1 -left-1"
                onMouseDown={(e) => handleResizeStart(e, "nw")}
              ></div>
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize -top-1 -right-1"
                onMouseDown={(e) => handleResizeStart(e, "ne")}
              ></div>
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize -bottom-1 -left-1"
                onMouseDown={(e) => handleResizeStart(e, "sw")}
              ></div>
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize -bottom-1 -right-1"
                onMouseDown={(e) => handleResizeStart(e, "se")}
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
                  boxShadow: `0 0 0 ${Math.max(imageSize.width, imageSize.height)}px rgba(0,0,0,0.5)`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm mb-4">
          Mavi alanı sürükleyerek taşıyın, köşelerdeki noktaları sürükleyerek
          boyutlandırın
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
  );
}

export default SettingsPage;

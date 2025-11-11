import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";
import BackButton from "./BackButton";

function ArkadeHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currentPage } = useNavigation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [notificationDropdownPosition, setNotificationDropdownPosition] =
    useState({ top: 0, right: 0 });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isNotificationDetailOpen, setIsNotificationDetailOpen] =
    useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);

  // Bildirimleri localStorage'dan yükle
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const storedNotifications = JSON.parse(
          localStorage.getItem("notifications") || "[]",
        );
        const userReadStatus = JSON.parse(
          localStorage.getItem(`notificationReadStatus_${user?.id}`) || "{}",
        );

        // Bildirimleri kullanıcı bazlı okunma durumu ile birleştir
        const notificationsWithReadStatus = storedNotifications.map(
          (notification) => ({
            ...notification,
            read: userReadStatus[notification.id] || false,
            time: formatNotificationTime(notification.timestamp),
          }),
        );

        setNotifications(notificationsWithReadStatus);
      } catch (error) {
        console.error("Bildirimler yüklenirken hata:", error);
        setNotifications([]);
      }
    };

    if (user?.id) {
      loadNotifications();

      // localStorage değişikliklerini dinle
      const handleStorageChange = (e) => {
        if (e.key === "notifications") {
          loadNotifications();
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [user?.id]);

  // Zaman formatı helper fonksiyonu
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return "Bilinmeyen zaman";

    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Az önce";
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;

    return notificationTime.toLocaleDateString("tr-TR");
  };

  // Dropdown pozisyonunu hesapla
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  // Bildirim dropdown pozisyonunu hesapla
  const updateNotificationDropdownPosition = () => {
    if (notificationButtonRef.current) {
      const rect = notificationButtonRef.current.getBoundingClientRect();
      setNotificationDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Bildirim detay görüntüleme
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsNotificationDetailOpen(true);
    setIsNotificationDropdownOpen(false);

    // Bildirimi okundu olarak işaretle
    markNotificationAsRead(notification.id);
  };

  // Bildirimi okundu olarak işaretle
  const markNotificationAsRead = (notificationId) => {
    if (!user?.id) return;

    try {
      // Kullanıcı bazlı okunma durumunu güncelle
      const userReadStatus = JSON.parse(
        localStorage.getItem(`notificationReadStatus_${user.id}`) || "{}",
      );
      const readTime = new Date().toISOString();

      userReadStatus[notificationId] = true;
      userReadStatus[`${notificationId}_readAt`] = readTime;

      localStorage.setItem(
        `notificationReadStatus_${user.id}`,
        JSON.stringify(userReadStatus),
      );

      // State'i güncelle
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      );
    } catch (error) {
      console.error("Bildirim okunma durumu güncellenirken hata:", error);
    }
  };

  // Tüm bildirimleri okundu olarak işaretle
  const markAllNotificationsAsRead = () => {
    if (!user?.id) return;

    try {
      // Kullanıcı bazlı okunma durumunu güncelle
      const userReadStatus = JSON.parse(
        localStorage.getItem(`notificationReadStatus_${user.id}`) || "{}",
      );
      const readTime = new Date().toISOString();

      notifications.forEach((notification) => {
        userReadStatus[notification.id] = true;
        userReadStatus[`${notification.id}_readAt`] = readTime;
      });

      localStorage.setItem(
        `notificationReadStatus_${user.id}`,
        JSON.stringify(userReadStatus),
      );

      // State'i güncelle
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Tüm bildirimler okundu işaretlenirken hata:", error);
    }
  };

  const closeNotificationDetail = () => {
    setIsNotificationDetailOpen(false);
    setSelectedNotification(null);
  };

  // Bildirim silme
  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
    if (selectedNotification && selectedNotification.id === notificationId) {
      closeNotificationDetail();
    }
  };

  // Breadcrumb yapısını oluştur
  const getBreadcrumb = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);

    const breadcrumbMap = {
      "/arkade": "Arkade",
      "/arkade/library": "Arkade / Kütüphane",
      "/arkade/cycle": "Arkade / Döngü Planlayıcısı",
      "/arkade/session": "Arkade / Aktif Session",
      "/backlog": "Backlog Yönetimi",
      "/stats": "Oyun İstatistikleri",
      "/wishlist": "İstek listesi",
      "/gallery": "Oyun Galerisi",
    };

    return breadcrumbMap[path] || "Arkade";
  };

  return (
    <header
      data-registry="H"
      id="arkade-header"
      className="h-20 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-green-500/20 flex items-center justify-between px-8"
    >
      {/* Logo ve Brand */}
      <div
        data-registry="H1"
        id="header-brand"
        className="flex items-center gap-4"
      >
        <button
          data-registry="H1.1"
          id="logo-button"
          onClick={() => navigate("/")}
          className="flex items-center gap-4 hover:opacity-80 transition-opacity"
        >
          <div
            data-registry="H1.1.1"
            id="logo-icon"
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-lg shadow-green-500/25"
          >
            <span className="text-2xl">🎮</span>
          </div>
          <div data-registry="H1.1.2" id="logo-text">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Arkade
            </h1>
            <p className="text-sm text-green-300">Gaming Dashboard</p>
          </div>
        </button>

        {/* Breadcrumb */}
        <div
          data-registry="H1.2"
          id="breadcrumb"
          className="ml-6 flex items-center gap-2"
        >
          <span className="text-gray-400">|</span>
          <div className="flex items-center gap-2">
            <span
              data-registry="H1.2.1"
              id="breadcrumb-icon"
              className="text-lg"
            >
              {currentPage?.icon || "🎮"}
            </span>
            <span
              data-registry="H1.2.2"
              id="breadcrumb-title"
              className="text-sm text-gray-300 font-medium"
            >
              {currentPage?.title || "Arkade"}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar - Yakında */}
      <div
        data-registry="H2"
        id="search-section"
        className="flex-1 max-w-md mx-8"
      >
        <div className="relative group">
          <div
            data-registry="H2.1"
            id="search-input"
            className="w-full bg-gradient-to-r from-gray-800/30 via-gray-700/30 to-gray-800/30 border border-gray-600/30 rounded-xl px-4 py-2 pl-10 text-gray-500 cursor-not-allowed transition-all"
          >
            <span className="text-sm">🔍 Akıllı Arama - Yakında</span>
          </div>
          <div
            data-registry="H2.1.1"
            id="search-icon"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            🚀
          </div>

          {/* Hover Tooltip */}
          <div
            data-registry="H2.2"
            id="search-tooltip"
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50"
          >
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-lg p-3 shadow-xl min-w-[280px]">
              <div className="text-center">
                <div className="text-lg mb-2">🔍✨</div>
                <h4 className="text-white font-semibold text-sm mb-2">
                  Akıllı Arama Sistemi
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  AI destekli oyun arama, otomatik tamamlama ve akıllı filtreler
                  yakında geliyor!
                </p>
                <div className="mt-2 flex items-center justify-center gap-1 text-green-400">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">
                    Geliştirme Aşamasında
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gaming Stats & Actions */}
      <div
        data-registry="H3"
        id="header-actions"
        className="flex items-center gap-4"
      >
        {/* Notifications */}
        <div
          data-registry="H3.1"
          id="notifications-section"
          className="relative z-[10000]"
        >
          <button
            data-registry="H3.1.1"
            id="notifications-button"
            ref={notificationButtonRef}
            onClick={() => {
              updateNotificationDropdownPosition();
              setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
            }}
            className="relative p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-lg">🔔</span>
            {notifications.some((n) => !n.read) && (
              <div
                data-registry="H3.1.1.1"
                id="notification-badge"
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
              ></div>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationDropdownOpen &&
            createPortal(
              <div
                data-registry="H3.1.2"
                id="notifications-dropdown"
                ref={notificationDropdownRef}
                className="fixed bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden z-[10000]"
                style={{
                  top: `${notificationDropdownPosition.top}px`,
                  right: `${notificationDropdownPosition.right}px`,
                }}
              >
                <div
                  data-registry="H3.1.2.1"
                  id="notifications-header"
                  className="p-4 border-b border-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Bildirimler</h3>
                    <button
                      data-registry="H3.1.2.1.1"
                      id="mark-all-read-btn"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Tümünü Okundu İşaretle
                    </button>
                  </div>
                </div>

                <div
                  data-registry="H3.1.2.2"
                  id="notifications-list"
                  className="max-h-80 overflow-y-auto"
                >
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        data-registry={`H3.1.2.2.${notification.id}`}
                        data-notification={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors cursor-pointer ${
                          !notification.read ? "bg-green-500/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              !notification.read
                                ? "bg-green-500"
                                : "bg-gray-600"
                            }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">
                                {notification.type === "game" && "🎮"}
                                {notification.type === "discount" && "💰"}
                                {notification.type === "achievement" && "🏆"}
                                {notification.type === "info" && "ℹ️"}
                                {notification.type === "success" && "✅"}
                                {notification.type === "warning" && "⚠️"}
                                {notification.type === "error" && "❌"}
                                {notification.type === "announcement" && "📢"}
                              </span>
                              <h4 className="text-white text-sm font-medium truncate">
                                {notification.title}
                              </h4>
                            </div>
                            <div className="text-gray-300 text-xs mb-1 line-clamp-2 prose prose-invert prose-xs max-w-none">
                              <ReactMarkdown>
                                {notification.message}
                              </ReactMarkdown>
                            </div>
                            <span className="text-gray-500 text-xs">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      data-registry="H3.1.2.2.empty"
                      id="notifications-empty"
                      className="p-8 text-center"
                    >
                      <div className="text-4xl mb-2">🔔</div>
                      <p className="text-gray-400 text-sm">
                        Henüz bildirim yok
                      </p>
                    </div>
                  )}
                </div>
              </div>,
              document.body,
            )}
        </div>

        {/* User Profile */}
        <div
          data-registry="H3.2"
          id="profile-section"
          className="relative z-[10000]"
        >
          <button
            data-registry="H3.2.1"
            id="profile-button"
            ref={buttonRef}
            onClick={() => {
              updateDropdownPosition();
              setIsProfileDropdownOpen(!isProfileDropdownOpen);
            }}
            className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-2 hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div
              data-registry="H3.2.1.1"
              id="profile-avatar"
              className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-lg"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {user?.avatar || user?.username?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div
              data-registry="H3.2.1.2"
              id="profile-info"
              className="text-left"
            >
              <div className="text-white font-medium text-sm">
                {user?.username}
              </div>
              <div className="text-green-400 text-xs flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {user?.role === "admin" ? "Admin" : "Kullanıcı"}
              </div>
            </div>
            <span
              data-registry="H3.2.1.3"
              id="profile-dropdown-arrow"
              className={`text-gray-400 text-sm transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen &&
            createPortal(
              <div
                data-registry="H3.2.2"
                id="profile-dropdown"
                ref={dropdownRef}
                className="fixed w-64 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[99999]"
                style={{
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                }}
              >
                <div
                  data-registry="H3.2.2.1"
                  id="profile-dropdown-header"
                  className="p-4 border-b border-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-lg">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {user?.avatar ||
                            user?.username?.[0]?.toUpperCase() ||
                            "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {user?.username}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {user?.role === "admin"
                          ? "Admin Kullanıcı"
                          : "Standart Kullanıcı"}
                      </div>
                      <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Çevrimiçi
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  data-registry="H3.2.2.2"
                  id="profile-dropdown-menu"
                  className="p-2"
                >
                  <button
                    data-registry="H3.2.2.2.1"
                    id="profile-menu-profile"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      alert(
                        "Profil sayfası henüz hazır değil. Yakında geliyor!",
                      );
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <span className="text-lg">👤</span>
                    <span className="text-white">Profil (Yakında)</span>
                  </button>

                  <button
                    data-registry="H3.2.2.2.2"
                    id="profile-menu-settings"
                    onClick={() => {
                      navigate("/settings");
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <span className="text-lg">⚙️</span>
                    <span className="text-white">Ayarlar</span>
                  </button>

                  {/* İstatistikler menüsü kaldırıldı */}

                  <div className="border-t border-gray-700/50 my-2"></div>

                  <button
                    data-registry="H3.2.2.2.3"
                    id="profile-menu-logout"
                    onClick={() => {
                      logout();
                      setIsProfileDropdownOpen(false);
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-left"
                  >
                    <span className="text-lg">🚪</span>
                    <span className="text-red-400">Çıkış Yap</span>
                  </button>
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>
      <BackButton />

      {/* Bildirim Detay Modal */}
      {isNotificationDetailOpen &&
        selectedNotification &&
        createPortal(
          <div
            data-registry="H4"
            id="notification-detail-modal"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[20000] flex items-center justify-center p-4"
          >
            <div
              data-registry="H4.1"
              id="notification-detail-content"
              className="bg-gray-900 rounded-xl border border-gray-700 max-w-md w-full max-h-[80vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div
                data-registry="H4.1.1"
                id="notification-detail-header"
                className="flex items-center justify-between p-6 border-b border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {selectedNotification.type === "game" && "🎮"}
                    {selectedNotification.type === "discount" && "💰"}
                    {selectedNotification.type === "achievement" && "🏆"}
                    {selectedNotification.type === "info" && "📘"}
                    {selectedNotification.type === "success" && "✅"}
                    {selectedNotification.type === "warning" && "⚠️"}
                    {selectedNotification.type === "error" && "❌"}
                    {selectedNotification.type === "announcement" && "📢"}
                  </span>
                  <h3 className="text-white font-bold text-lg">
                    Bildirim Detayı
                  </h3>
                </div>
                <button
                  data-registry="H4.1.1.1"
                  id="notification-detail-close"
                  onClick={closeNotificationDetail}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div
                data-registry="H4.1.2"
                id="notification-detail-body"
                className="p-6 space-y-4"
              >
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2">
                    {selectedNotification.title}
                  </h4>
                  <div className="text-gray-300 leading-relaxed prose prose-invert max-w-none">
                    <ReactMarkdown>
                      {selectedNotification.message}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-700">
                  <span>📅 {selectedNotification.time}</span>
                  {selectedNotification.sender && (
                    <span>👤 {selectedNotification.sender}</span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedNotification.read
                        ? "bg-gray-600 text-gray-300"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {selectedNotification.read ? "Okundu" : "Yeni"}
                  </span>
                </div>

                {/* Ek bilgiler varsa */}
                {selectedNotification.details && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Detaylar</h5>
                    <p className="text-gray-300 text-sm">
                      {selectedNotification.details}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div
                data-registry="H4.1.3"
                id="notification-detail-footer"
                className="flex items-center justify-between p-6 border-t border-gray-700"
              >
                <button
                  data-registry="H4.1.3.1"
                  id="notification-delete-btn"
                  onClick={() => deleteNotification(selectedNotification.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  🗑️ Sil
                </button>
                <button
                  data-registry="H4.1.3.2"
                  id="notification-close-btn"
                  onClick={closeNotificationDetail}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}

export default ArkadeHeader;

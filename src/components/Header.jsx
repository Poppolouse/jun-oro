import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTutorial, useTutorialAdmin } from "../hooks/useTutorial";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { startTutorial } = useTutorial();
  const { isAdmin } = useTutorialAdmin();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [isTutorialDropdownOpen, setIsTutorialDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [notificationDropdownPosition, setNotificationDropdownPosition] =
    useState({ top: 0, right: 0 });
  const [tutorialDropdownPosition, setTutorialDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const tutorialDropdownRef = useRef(null);
  const tutorialButtonRef = useRef(null);

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

  // Tutorial dropdown pozisyonunu hesapla
  const updateTutorialDropdownPosition = () => {
    if (tutorialButtonRef.current) {
      const rect = tutorialButtonRef.current.getBoundingClientRect();
      setTutorialDropdownPosition({
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
      if (
        tutorialDropdownRef.current &&
        !tutorialDropdownRef.current.contains(event.target) &&
        tutorialButtonRef.current &&
        !tutorialButtonRef.current.contains(event.target)
      ) {
        setIsTutorialDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Bildirimi okundu olarak işaretle
  const markAsRead = (notificationId) => {
    try {
      const userReadStatus = JSON.parse(
        localStorage.getItem(`notificationReadStatus_${user?.id}`) || "{}",
      );
      userReadStatus[notificationId] = true;
      localStorage.setItem(
        `notificationReadStatus_${user?.id}`,
        JSON.stringify(userReadStatus),
      );

      // State'i güncelle
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Bildirim okundu olarak işaretlenirken hata:", error);
    }
  };

  return (
    <header className="h-20 bg-gradient-to-r from-[#1a1a2e]/90 via-[#2d1b69]/90 to-[#1a1a2e]/90 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between px-8">
      {/* Logo ve Brand */}
      <div
        className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
          <span className="text-2xl font-bold text-white">J</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Jun-Oro
          </h1>
          <p className="text-sm text-purple-300">Gaming Dashboard</p>
        </div>
      </div>

      {/* Boş alan - arama çubuğu kaldırıldı */}
      <div className="flex-1"></div>

      {/* User Profile & Actions */}
      <div className="flex items-center gap-4">
        {/* Tutorial / Help Button */}
        <div className="relative z-[10000]">
          <button
            id="header-tutorial-btn"
            data-registry="H3.3.1"
            ref={tutorialButtonRef}
            onClick={() => {
              // '?' ikonuna tıklandığında doğrudan tutorial'ı başlat
              try {
                startTutorial();
              } finally {
                setIsTutorialDropdownOpen(false);
              }
            }}
            className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Tutorial'ı Başlat"
          >
            <span className="text-lg">❓</span>
          </button>
        </div>

        {/* Notifications */}
        <div className="relative z-[10000]">
          <button
            ref={notificationButtonRef}
            onClick={() => {
              updateNotificationDropdownPosition();
              setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
            }}
            className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-lg">🔔</span>
            {notifications.some((n) => !n.read) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationDropdownOpen &&
            createPortal(
              <div
                ref={notificationDropdownRef}
                className="fixed bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden z-[10000]"
                style={{
                  top: `${notificationDropdownPosition.top}px`,
                  right: `${notificationDropdownPosition.right}px`,
                }}
              >
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-white font-semibold">Bildirimler</h3>
                  {notifications.some((n) => !n.read) && (
                    <p className="text-purple-400 text-xs mt-1">
                      {notifications.filter((n) => !n.read).length} okunmamış
                      bildirim
                    </p>
                  )}
                </div>

                <div className="overflow-y-auto max-h-80">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-3 border-b border-gray-700/30 hover:bg-gray-700/30 cursor-pointer transition-colors ${
                          !notification.read ? "bg-purple-500/10" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-lg">{notification.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-white text-sm font-medium truncate">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
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
        <div className="relative z-[10000]">
          <button
            ref={buttonRef}
            onClick={() => {
              updateDropdownPosition();
              setIsProfileDropdownOpen(!isProfileDropdownOpen);
            }}
            className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2 hover:bg-white/15 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
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
            <div className="text-left">
              <div className="text-white font-medium text-sm">
                {user?.username}
              </div>
              <div className="text-purple-400 text-xs flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                {user?.role === "admin" ? "Admin" : "Kullanıcı"}
              </div>
            </div>
            <span
              className={`text-gray-400 text-sm transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen &&
            createPortal(
              <div
                ref={dropdownRef}
                className="fixed w-64 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[99999]"
                style={{
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                }}
              >
                <div className="p-4 border-b border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
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
                      <div className="text-purple-400 text-xs flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        Çevrimiçi
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
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
                    onClick={() => {
                      navigate("/settings");
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <span className="text-lg">⚙️</span>
                    <span className="text-white">Ayarlar</span>
                  </button>

                  <div className="border-t border-gray-700/50 my-2"></div>

                  <button
                    onClick={() => {
                      logout();
                      setIsProfileDropdownOpen(false);
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left"
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
    </header>
  );
}

export default Header;

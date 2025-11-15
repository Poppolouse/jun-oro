import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDesignEditor } from "../contexts/DesignEditorContext";
import { useTutorial } from "../hooks/useTutorial";

// --- HELPER & UTILITY FUNCTIONS ---

/**
 * Verilen bir zaman damgasını "Az önce", "X dakika önce" gibi okunabilir bir formata çevirir.
 * @param {string | number} timestamp - Formatlanacak olan Date timestamp'i.
 * @returns {string} Formatlanmış zaman metni.
 */
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

// --- CUSTOM HOOKS ---

/**
 * Dropdown menülerin pozisyonunu, görünürlüğünü ve dışarıya tıklama davranışını yönetir.
 * @returns {{
 *   isOpen: boolean,
 *   toggle: () => void,
 *   close: () => void,
 *   buttonRef: React.RefObject<HTMLButtonElement>,
 *   dropdownRef: React.RefObject<HTMLDivElement>,
 *   position: { top: number, right: number }
 * }}
 */
const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggle = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  return { isOpen, toggle, close, buttonRef, dropdownRef, position };
};

/**
 * Kullanıcı bildirimlerini yönetir, localStorage'dan yükler ve günceller.
 * @param {string | undefined} userId - Mevcut kullanıcının ID'si.
 * @returns {{
 *   notifications: Array<object>,
 *   unreadCount: number,
 *   markAsRead: (notificationId: string) => void
 * }}
 */
const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(() => {
    if (!userId) return;
    try {
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      const readStatus = JSON.parse(
        localStorage.getItem(`notificationReadStatus_${userId}`) || "{}",
      );

      const processed = stored.map((n) => ({
        ...n,
        read: readStatus[n.id] || false,
        time: formatNotificationTime(n.timestamp),
      }));
      setNotifications(processed);
    } catch (error) {
      console.error("Bildirimler yüklenirken hata:", error);
      setNotifications([]);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
    const handleStorageChange = (e) => {
      if (e.key === "notifications") {
        loadNotifications();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userId, loadNotifications]);

  const markAsRead = useCallback(
    (notificationId) => {
      if (!userId) return;
      try {
        const readStatus = JSON.parse(
          localStorage.getItem(`notificationReadStatus_${userId}`) || "{}",
        );
        readStatus[notificationId] = true;
        localStorage.setItem(
          `notificationReadStatus_${userId}`,
          JSON.stringify(readStatus),
        );
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
        );
      } catch (error) {
        console.error("Bildirim okundu olarak işaretlenirken hata:", error);
      }
    },
    [userId],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markAsRead };
};

// --- SUB-COMPONENTS ---


const Logo = () => {
  const navigate = useNavigate();
  return (
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
  );
};

const TutorialButton = () => {
  const { startTutorial } = useTutorial();
  return (
    <button
      id="header-tutorial-btn"
      data-registry="H3.3.1"
      onClick={() => startTutorial()}
      className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      title="Tutorial'ı Başlat"
    >
      <span className="text-lg">❓</span>
    </button>
  );
};

const NotificationBell = ({ buttonRef, onClick, unreadCount }) => (
  <button
    ref={buttonRef}
    onClick={onClick}
    className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
  >
    <span className="text-lg">🔔</span>
    {unreadCount > 0 && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
    )}
  </button>
);

const NotificationDropdown = ({
  dropdownRef,
  position,
  notifications,
  unreadCount,
  markAsRead,
}) =>
  createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden z-[10000]"
      style={{ top: `${position.top}px`, right: `${position.right}px` }}
    >
      <div className="p-4 border-b border-gray-700/50">
        <h3 className="text-white font-semibold">Bildirimler</h3>
        {unreadCount > 0 && (
          <p className="text-purple-400 text-xs mt-1">
            {unreadCount} okunmamış bildirim
          </p>
        )}
      </div>
      <div className="overflow-y-auto max-h-80">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-3 border-b border-gray-700/30 hover:bg-gray-700/30 cursor-pointer transition-colors ${
                !n.read ? "bg-purple-500/10" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-lg">{n.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white text-sm font-medium truncate">
                      {n.title}
                    </h4>
                    {!n.read && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-gray-400 text-sm">Henüz bildirim yok</p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );

const UserAvatar = ({ user }) => (
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
);

const ProfileButton = ({ buttonRef, onClick, user, isOpen }) => (
  <button
    ref={buttonRef}
    onClick={onClick}
    className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2 hover:bg-white/15 transition-colors cursor-pointer"
  >
    <UserAvatar user={user} />
    <div className="text-left">
      <div className="text-white font-medium text-sm">{user?.username}</div>
      <div className="text-purple-400 text-xs flex items-center gap-1">
        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
        {user?.role === "admin" ? "Admin" : "Kullanıcı"}
      </div>
    </div>
    <span
      className={`text-gray-400 text-sm transition-transform ${
        isOpen ? "rotate-180" : ""
      }`}
    >
      ▼
    </span>
  </button>
);

const ProfileDropdown = ({ dropdownRef, position, user, onLogout, onClose }) => {
  const navigate = useNavigate();
  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-64 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[99999]"
      style={{ top: `${position.top}px`, right: `${position.right}px` }}
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
                {user?.avatar || user?.username?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div>
            <div className="text-white font-medium">{user?.username}</div>
            <div className="text-gray-400 text-sm">
              {user?.role === "admin" ? "Admin Kullanıcı" : "Standart Kullanıcı"}
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
            onClose();
            alert("Profil sayfası henüz hazır değil. Yakında geliyor!");
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
        >
          <span className="text-lg">👤</span>
          <span className="text-white">Profil (Yakında)</span>
        </button>
        <button
          onClick={() => {
            navigate("/settings");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
        >
          <span className="text-lg">⚙️</span>
          <span className="text-white">Ayarlar</span>
        </button>
        <div className="border-t border-gray-700/50 my-2"></div>
        <button
          onClick={() => {
            onLogout();
            onClose();
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
  );
};

/**
 * Admin Toggle Switch Component
 * Design Editor için mod değiştirme butonu
 */
const AdminToggleSwitch = ({ mode, activeMode, onClick, label }) => {
  const isActive = activeMode === mode;
  
  return (
    <button
      onClick={onClick}
      data-design-editor-ignore="true"
      className={`
        px-4 py-2 rounded-lg font-medium text-sm transition-all
        ${isActive
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
        }
      `}
    >
      {label}
    </button>
  );
};

/**
 * Uygulamanın ana başlık (header) bileşeni.
 * Logo, navigasyon, bildirimler ve kullanıcı profili gibi temel aksiyonları içerir.
 *
 * @returns {JSX.Element} Render edilmiş Header bileşeni.
 */
function Header() {
  try {
    const { user, logout } = useAuth();
    const isAdmin = user?.role === "admin";
    const { state, dispatch } = useDesignEditor();
    
    const {
      notifications,
      unreadCount,
      markAsRead,
    } = useNotifications(user?.id);

  const profileDropdown = useDropdown();
  const notificationDropdown = useDropdown();

  // Design Editor mod değiştirme
  const handleSelectMode = () => {
    const newMode = state.mode === 'select' ? 'inactive' : 'select';
    console.log('🔵 Seç modu:', newMode);
    dispatch({ type: 'SET_MODE', payload: newMode });
  };

  const handleDesignMode = () => {
    const newMode = state.mode === 'design' ? 'inactive' : 'design';
    console.log('🟢 Tasarla modu:', newMode);
    dispatch({ type: 'SET_MODE', payload: newMode });
  };

  return (
    <header className="h-20 bg-gradient-to-r from-[#1a1a2e]/90 via-[#2d1b69]/90 to-[#1a1a2e]/90 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <Logo />
        {/* Admin Design Editor Toggle'ları */}
        {isAdmin && (
          <div className="flex items-center gap-2 ml-6" data-design-editor-ignore="true">
            <AdminToggleSwitch
              mode="select"
              activeMode={state.mode}
              onClick={handleSelectMode}
              label="Seç"
            />
            <AdminToggleSwitch
              mode="design"
              activeMode={state.mode}
              onClick={handleDesignMode}
              label="Tasarla"
            />
          </div>
        )}
        {/* Debug: Admin kontrolü */}
        {!isAdmin && (
          <div style={{ color: 'red', fontSize: '12px', marginLeft: '20px' }}>
            ⚠️ Admin değilsin! user.role: {user?.role}
          </div>
        )}
      </div>
      <div className="flex-1"></div> {/* Spacer */}
      <div className="flex items-center gap-4">
        <div className="relative z-[10000]">
          <TutorialButton />
        </div>

        <div className="relative z-[10000]">
          <NotificationBell
            buttonRef={notificationDropdown.buttonRef}
            onClick={notificationDropdown.toggle}
            unreadCount={unreadCount}
          />
          {notificationDropdown.isOpen && (
            <NotificationDropdown
              dropdownRef={notificationDropdown.dropdownRef}
              position={notificationDropdown.position}
              notifications={notifications}
              unreadCount={unreadCount}
              markAsRead={markAsRead}
            />
          )}
        </div>

        <div className="relative z-[10000]">
          <ProfileButton
            buttonRef={profileDropdown.buttonRef}
            onClick={profileDropdown.toggle}
            user={user}
            isOpen={profileDropdown.isOpen}
          />
          {profileDropdown.isOpen && (
            <ProfileDropdown
              dropdownRef={profileDropdown.dropdownRef}
              position={profileDropdown.position}
              user={user}
              onLogout={logout}
              onClose={profileDropdown.close}
            />
          )}
        </div>
      </div>
    </header>
  );
  } catch (error) {
    console.error('❌ Header render hatası:', error);
    return (
      <header className="h-20 bg-red-900 flex items-center justify-center">
        <div className="text-white">Header Hatası: {error.message}</div>
      </header>
    );
  }
}

export default Header;

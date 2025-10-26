import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: '🏠', label: 'Ana Sayfa', path: '/arkade' },
    { icon: '📚', label: 'Kütüphane', path: '/arkade/kutuphane' },
    { icon: '🎯', label: 'Backlog', path: '/arkade/backlog' },
    { icon: '⏱️', label: 'Aktif Oturum', path: '/arkade/aktif-oturum' },
    { icon: '💭', label: 'Wishlist', path: '/arkade/wishlist' },
    { icon: '📊', label: 'İstatistikler', path: '/arkade/istatistikler' },
    { icon: '🖼️', label: 'Galeri', path: '/arkade/galeri' },
    { icon: '🏆', label: 'Yarış', path: '/arkade/yaris' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-surface-elevated border-r border-border-default h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border-default">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎮</span>
          <h2 className="text-xl font-bold text-text-primary">Arkade</h2>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-accent-primary text-white font-medium shadow-[0_0_20px_rgba(76,110,245,0.4)]'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border-default">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
        >
          <span>←</span>
          <span className="text-sm">Hub'a Dön</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
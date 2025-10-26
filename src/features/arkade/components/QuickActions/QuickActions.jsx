import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { icon: '⏱️', label: 'Oturum Başlat', path: '/arkade/aktif-oturum' },
    { icon: '➕', label: 'Yeni Oyun Ekle', path: '/arkade/kutuphane' },
    { icon: '🔍', label: 'Oyun Ara', path: '/arkade/kutuphane' },
    { icon: '🔄', label: 'Cycle Ekranı', path: '/arkade/cycle' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => navigate(action.path)}
          className="bg-surface-elevated backdrop-blur-xl bg-opacity-60 border border-border-default rounded-xl p-4 hover:bg-opacity-80 hover:shadow-[0_0_20px_rgba(76,110,245,0.3)] transition-all group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
          <div className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{action.label}</div>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
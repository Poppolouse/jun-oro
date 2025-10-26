import ActiveSessionCard from '../ActiveSessionCard';
import QuickActions from '../QuickActions';
import StatCards from '../StatCards';

const HeroSection = () => {
  // TODO: Gerçek veri geldiğinde bu state'ler store'dan gelecek
  const hasActiveSession = false;
  const activeGame = null;

  const getDynamicMessage = () => {
    if (hasActiveSession && activeGame) {
      return `Devam et, Özgü! ${activeGame.title} seni bekliyor! 🎮`;
    }
    // TODO: Son 7 gün kontrol edilecek
    return 'Tekrar hoş geldin! 🔥';
  };

  return (
    <section className="relative bg-gradient-to-br from-surface-elevated to-background-primary border-b border-border-default">
      <div className="p-8 md:p-12">
        {/* Dynamic Welcome Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-8">
          {getDynamicMessage()}
        </h1>

        {/* Active Session Card */}
        <div className="mb-6">
          <ActiveSessionCard 
            hasActiveSession={hasActiveSession}
            activeGame={activeGame}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <QuickActions />
        </div>

        {/* Stat Cards */}
        <StatCards />
      </div>
    </section>
  );
};

export default HeroSection;
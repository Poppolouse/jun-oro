import ArkadeLayout from '../features/arkade/layout';
import HeroSection from '../features/arkade/components/HeroSection';

const Arkade = () => {
  return (
    <ArkadeLayout>
      <HeroSection />
      
      {/* Hero altı bölümler buraya gelecek */}
      <div className="p-8">
        <p className="text-text-secondary text-center">Devam eden oyunlar, backlog önizlemesi ve diğer bölümler buraya gelecek...</p>
      </div>
    </ArkadeLayout>
  );
};

export default Arkade;
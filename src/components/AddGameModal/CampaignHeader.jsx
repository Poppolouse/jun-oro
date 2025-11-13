import React from "react";
import { calculateTotalDuration } from "./utils";

/**
 * CampaignHeader Component - Campaign yönetimi başlık ve özet bilgileri
 * @param {Object} props - Component props
 * @param {Array} props.campaigns - Campaign listesi
 * @param {Object} props.selectedGame - Seçilen oyun
 * @param {Function} props.onBack - Geri dönme fonksiyonu
 */
const CampaignHeader = ({ campaigns, selectedGame, onBack }) => {
  /**
   * Ana campaign'leri getirir
   * @returns {Array} - Ana campaign listesi
   */
  const getMainCampaigns = () => {
    return campaigns.filter((c) => !c.parentId);
  };

  return (
    <div className="text-center" data-ers="add-game-modal.campaign-header">
      <h3 className="text-xl font-bold text-white mb-2">Campaign yönetimi</h3>
      <p className="text-gray-400">
        {selectedGame
          ? `${selectedGame.name} için campaign'ler`
          : "Oyun campaign'lerini yönetin"}
      </p>

      {/* Toplam Süre Gösterimi */}
      {campaigns.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-[#00ff88]/10 to-[#00d4ff]/10 border border-[#00ff88]/30 rounded-lg">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-[#00ff88] font-bold text-lg">
                {campaigns.length}
              </div>
              <div className="text-gray-400 text-xs">Campaign</div>
            </div>
            {calculateTotalDuration(campaigns) && (
              <>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-[#00d4ff] font-bold text-lg">
                    {calculateTotalDuration(campaigns)}
                  </div>
                  <div className="text-gray-400 text-xs">Toplam Süre</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Campaign Zorunluluğu Uyarısı */}
      {campaigns.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-yellow-400 text-xl">⚠️</div>
            <div>
              <div className="text-yellow-400 font-medium text-sm">
                Campaign Gerekli
              </div>
              <div className="text-gray-400 text-xs">
                Oyunu eklemek için en az 1 campaign eklemelisiniz.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geri Dön Butonu */}
      {onBack && (
        <div className="mt-6">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            data-ers="add-game-modal.back-button"
          >
            ← Geri Dön
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignHeader;

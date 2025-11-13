import React, { useState } from "react";

/**
 * CampaignForm Component - Campaign ekleme/düzenleme formu
 * @param {Object} props - Component props
 * @param {Object} props.currentCampaign - Mevcut campaign verisi
 * @param {Function} props.setCurrentCampaign - Campaign verisini ayarlar
 * @param {Array} props.mainCampaigns - Ana campaign listesi
 * @param {Function} props.onSave - Kaydetme fonksiyonu
 */
const CampaignForm = ({
  currentCampaign,
  setCurrentCampaign,
  mainCampaigns,
  onSave,
}) => {
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: "",
    value: "",
    type: "text",
  });

  /**
   * Özel özellik ekler
   */
  const addCustomProperty = () => {
    if (!newProperty.name.trim()) return;

    setCurrentCampaign((prev) => ({
      ...prev,
      customProperties: [
        ...prev.customProperties,
        { ...newProperty, id: Date.now() },
      ],
    }));

    setNewProperty({ name: "", value: "", type: "text" });
    setShowAddProperty(false);
  };

  /**
   * Özel özellik siler
   * @param {number} propertyId - Özellik ID'si
   */
  const removeCustomProperty = (propertyId) => {
    setCurrentCampaign((prev) => ({
      ...prev,
      customProperties: prev.customProperties.filter(
        (p) => p.id !== propertyId,
      ),
    }));
  };

  /**
   * Input değişikliğini yönetir
   * @param {string} field - Alan adı
   * @param {any} value - Değer
   */
  const handleInputChange = (field, value) => {
    setCurrentCampaign((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div
      className="bg-white/5 rounded-lg p-6 border border-white/10"
      data-ers="add-game-modal.campaign-form"
    >
      <h4 className="text-lg font-semibold text-white mb-4">
        Campaign Bilgileri
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Campaign Adı
          </label>
          <input
            type="text"
            value={currentCampaign.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Örn: Main Story, Evil Playthrough, Nosferatu Clan"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
            data-ers="add-game-modal.campaign-name"
          />
        </div>

        {/* Parent Campaign */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ana Campaign
            <span className="text-xs text-gray-500 ml-1">
              (Alt campaign için)
            </span>
          </label>
          <select
            value={currentCampaign.parentId || ""}
            onChange={(e) =>
              handleInputChange("parentId", e.target.value || null)
            }
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00ff88]/50"
            data-ers="add-game-modal.parent-campaign"
          >
            <option value="" className="bg-gray-800">
              Ana Campaign (Bağımsız)
            </option>
            {mainCampaigns.map((campaign) => (
              <option
                key={campaign.id}
                value={campaign.id}
                className="bg-gray-800"
              >
                {campaign.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Average Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ortalama Süre
          </label>
          <input
            type="text"
            value={currentCampaign.averageDuration}
            onChange={(e) =>
              handleInputChange("averageDuration", e.target.value)
            }
            placeholder="Örn: 25 saat, 40-50 saat"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
            data-ers="add-game-modal.campaign-duration"
          />
        </div>

        {/* Campaign Type Indicator */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Campaign Türü
          </label>
          <div className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg">
            {currentCampaign.parentId ? (
              <span className="text-blue-400 text-sm">🔗 Alt Campaign</span>
            ) : (
              <span className="text-[#00ff88] text-sm">⭐ Ana Campaign</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Açıklama
        </label>
        <textarea
          value={currentCampaign.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Campaign'in özelliklerini, hikayesini veya oynama stilini açıklayın..."
          rows={3}
          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 resize-none"
          data-ers="add-game-modal.campaign-description"
        />
      </div>

      {/* Custom Properties */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">
            Özel Özellikler
          </label>
          <button
            onClick={() => setShowAddProperty(true)}
            className="px-3 py-1 bg-[#00ff88]/20 border border-[#00ff88]/30 rounded text-xs text-[#00ff88] hover:bg-[#00ff88]/30 transition-colors"
            data-ers="add-game-modal.add-property-button"
          >
            + Özellik Ekle
          </button>
        </div>

        {currentCampaign.customProperties.length > 0 && (
          <div className="space-y-2">
            {currentCampaign.customProperties.map((property) => (
              <div
                key={property.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">
                    {property.name}
                  </div>
                  <div className="text-xs text-gray-400">{property.value}</div>
                </div>
                <button
                  onClick={() => removeCustomProperty(property.id)}
                  className="w-6 h-6 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={onSave}
          disabled={!currentCampaign.name.trim()}
          className="flex-1 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          data-ers="add-game-modal.save-campaign-button"
        >
          Campaign Kaydet
        </button>
      </div>

      {/* Add Property Modal */}
      {showAddProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a0f2e] to-[#0a0e27] rounded-2xl border border-white/20 w-full max-w-md">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                Özel Özellik Ekle
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Özellik Adı
                  </label>
                  <input
                    type="text"
                    value={newProperty.name}
                    onChange={(e) =>
                      setNewProperty((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Örn: Faction, Playstyle, Difficulty"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Değer
                  </label>
                  <input
                    type="text"
                    value={newProperty.value}
                    onChange={(e) =>
                      setNewProperty((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    placeholder="Örn: Nosferatu, Stealth, Hard"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addCustomProperty}
                disabled={!newProperty.name.trim() || !newProperty.value.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ekle
              </button>
              <button
                onClick={() => setShowAddProperty(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignForm;

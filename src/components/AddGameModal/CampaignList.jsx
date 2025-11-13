import React, { useState } from "react";

/**
 * CampaignList Component - Campaign listesi gösterimi ve yönetimi
 * @param {Object} props - Component props
 * @param {Array} props.campaigns - Campaign listesi
 * @param {Function} props.setCampaigns - Campaign'leri ayarlar
 * @param {Function} props.onEdit - Düzenleme fonksiyonu
 * @param {Function} props.onAddSub - Alt campaign ekleme fonksiyonu
 * @param {Function} props.onDelete - Silme fonksiyonu
 */
const CampaignList = ({
  campaigns,
  setCampaigns,
  onEdit,
  onAddSub,
  onDelete,
}) => {
  const [expandedCampaigns, setExpandedCampaigns] = useState(new Set());
  const [expandedCampaignDetails, setExpandedCampaignDetails] = useState(
    new Set(),
  );

  /**
   * Ana campaign'leri getirir
   * @returns {Array} - Ana campaign listesi
   */
  const getMainCampaigns = () => {
    return campaigns.filter((c) => !c.parentId);
  };

  /**
   * Alt campaign'leri getirir
   * @param {string} parentId - Ana campaign ID'si
   * @returns {Array} - Alt campaign listesi
   */
  const getSubCampaigns = (parentId) => {
    return campaigns.filter((c) => c.parentId === parentId);
  };

  /**
   * Campaign genişletme durumunu değiştirir
   * @param {string} campaignId - Campaign ID'si
   */
  const toggleCampaignExpansion = (campaignId) => {
    const newSet = new Set(expandedCampaigns);
    if (newSet.has(campaignId)) {
      newSet.delete(campaignId);
    } else {
      newSet.add(campaignId);
    }
    setExpandedCampaigns(newSet);
  };

  /**
   * Campaign detaylarını göster/gizler
   * @param {string} campaignId - Campaign ID'si
   */
  const toggleCampaignDetails = (campaignId) => {
    const newSet = new Set(expandedCampaignDetails);
    if (newSet.has(campaignId)) {
      newSet.delete(campaignId);
    } else {
      newSet.add(campaignId);
    }
    setExpandedCampaignDetails(newSet);
  };

  /**
   * Campaign'i siler (ve alt campaign'lerini)
   * @param {string} campaignId - Campaign ID'si
   */
  const deleteCampaign = (campaignId) => {
    // Alt campaign'leri de sil
    const toDelete = [campaignId];
    const findChildren = (id) => {
      const children = campaigns.filter((c) => c.parentId === id);
      children.forEach((child) => {
        toDelete.push(child.id);
        findChildren(child.id);
      });
    };
    findChildren(campaignId);

    setCampaigns((prev) => prev.filter((c) => !toDelete.includes(c.id)));
  };

  /**
   * Campaign detaylarını render eder
   * @param {Object} campaign - Campaign objesi
   * @returns {JSX.Element} - Detaylar component'i
   */
  const renderCampaignDetails = (campaign) => {
    if (!expandedCampaignDetails.has(campaign.id)) return null;

    return (
      <div className="mt-3 ml-7 space-y-2">
        {campaign.averageDuration && (
          <div className="text-sm text-[#00ff88]">
            ⏱️ {campaign.averageDuration}
          </div>
        )}
        {campaign.description && (
          <p className="text-sm text-gray-400">{campaign.description}</p>
        )}
        {campaign.customProperties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {campaign.customProperties.map((prop) => (
              <span
                key={prop.id}
                className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300"
              >
                {prop.name}: {prop.value}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Alt campaign detaylarını render eder
   * @param {Object} campaign - Campaign objesi
   * @returns {JSX.Element} - Detaylar component'i
   */
  const renderSubCampaignDetails = (campaign) => {
    if (!expandedCampaignDetails.has(campaign.id)) return null;

    return (
      <div className="mt-2 space-y-1">
        {campaign.averageDuration && (
          <div className="text-sm text-[#00ff88]">
            ⏱️ {campaign.averageDuration}
          </div>
        )}
        {campaign.description && (
          <p className="text-sm text-gray-400">{campaign.description}</p>
        )}
        {campaign.customProperties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {campaign.customProperties.map((prop) => (
              <span
                key={prop.id}
                className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300"
              >
                {prop.name}: {prop.value}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (getMainCampaigns().length === 0) {
    return (
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">
          Kaydedilen Campaign'ler
        </h4>
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">Henüz campaign eklenmemiş</div>
          <div className="text-gray-500 text-xs mt-2">
            Yeni campaign eklemek için yukarıdaki formu kullanın
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white/5 rounded-lg p-6 border border-white/10"
      data-ers="add-game-modal.campaign-list"
    >
      <h4 className="text-lg font-semibold text-white mb-4">
        Kaydedilen Campaign'ler ({campaigns.length})
      </h4>

      <div className="space-y-3">
        {getMainCampaigns().map((campaign) => (
          <div key={campaign.id}>
            {/* Ana Campaign */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getSubCampaigns(campaign.id).length > 0 && (
                      <button
                        onClick={() => toggleCampaignExpansion(campaign.id)}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        data-ers={`add-game-modal.expand-campaign-${campaign.id}`}
                      >
                        {expandedCampaigns.has(campaign.id) ? "▼" : "▶"}
                      </button>
                    )}
                    <h5
                      className="text-white font-medium cursor-pointer hover:text-[#00ff88] transition-colors"
                      onClick={() => toggleCampaignDetails(campaign.id)}
                      data-ers={`add-game-modal.campaign-name-${campaign.id}`}
                    >
                      {campaign.name}
                    </h5>
                    <span className="px-2 py-1 bg-[#00ff88]/20 border border-[#00ff88]/30 rounded text-xs text-[#00ff88]">
                      Ana Campaign
                    </span>
                  </div>

                  {/* Campaign Detayları */}
                  {renderCampaignDetails(campaign)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAddSub(campaign.id)}
                    className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 hover:bg-green-500/30 transition-colors"
                    data-ers={`add-game-modal.add-sub-campaign-${campaign.id}`}
                  >
                    + Alt Campaign
                  </button>
                  <button
                    onClick={() => onEdit(campaign)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-gray-300 transition-colors"
                    data-ers={`add-game-modal.edit-campaign-${campaign.id}`}
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-500/30 transition-colors"
                    data-ers={`add-game-modal.delete-campaign-${campaign.id}`}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>

            {/* Alt Campaign'ler */}
            {expandedCampaigns.has(campaign.id) &&
              getSubCampaigns(campaign.id).length > 0 && (
                <div className="ml-8 mt-2 space-y-2">
                  {getSubCampaigns(campaign.id).map((subCampaign) => (
                    <div
                      key={subCampaign.id}
                      className="p-3 bg-white/5 rounded-lg border border-white/10 border-l-4 border-l-blue-500/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h6
                              className="text-white font-medium text-sm cursor-pointer hover:text-blue-400 transition-colors"
                              onClick={() =>
                                toggleCampaignDetails(subCampaign.id)
                              }
                              data-ers={`add-game-modal.sub-campaign-name-${subCampaign.id}`}
                            >
                              {subCampaign.name}
                            </h6>
                            <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                              Alt Campaign
                            </span>
                          </div>

                          {/* Alt Campaign Detayları */}
                          {renderSubCampaignDetails(subCampaign)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(subCampaign)}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-gray-300 transition-colors"
                            data-ers={`add-game-modal.edit-sub-campaign-${subCampaign.id}`}
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => deleteCampaign(subCampaign.id)}
                            className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-500/30 transition-colors"
                            data-ers={`add-game-modal.delete-sub-campaign-${subCampaign.id}`}
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignList;

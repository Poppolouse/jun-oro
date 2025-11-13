import React from "react";
import CampaignHeader from "./CampaignHeader";
import CampaignTools from "./CampaignTools";
import CampaignForm from "./CampaignForm";
import CampaignList from "./CampaignList";

/**
 * CampaignManagement Component - Campaign ve DLC'leri yönetmek için bir sunum arayüzü.
 * Bu bileşen, tüm state yönetimini ve mantığı props aracılığıyla üst bileşenlerden alır.
 *
 * @param {Object} props - Component props
 * @param {Array} props.campaigns - Görüntülenecek campaign listesi.
 * @param {Array} props.dlcs - Görüntülenecek DLC listesi.
 * @param {Object} props.currentCampaign - Formda düzenlenmekte olan mevcut campaign nesnesi.
 * @param {Function} props.onCampaignChange - Campaign formundaki değişiklikleri yöneten fonksiyon.
 * @param {Function} props.onDlcChange - DLC seçimindeki değişiklikleri yöneten fonksiyon.
 * @param {Function} props.onSaveCampaign - Mevcut campaign'i kaydetmek için çağrılan fonksiyon.
 * @param {Function} props.onEditCampaign - Bir campaign'i düzenleme moduna almak için çağrılan fonksiyon.
 * @param {Function} props.onDeleteCampaign - Bir campaign'i silmek için çağrılan fonksiyon.
 * @param {Function} props.onAddSubCampaign - Bir campaign'e alt campaign eklemek için çağrılan fonksiyon.
 * @param {Function} props.onNewCampaign - Yeni bir campaign oluşturma formunu açmak için çağrılan fonksiyon.
 * @param {Function} props.onImport - Metin dosyasından campaign'leri içe aktarmak için çağrılan fonksiyon.
 * @param {Object} props.selectedGame - Üzerinde işlem yapılan seçili oyun.
 * @param {Function} props.onBack - Bir önceki ekrana dönmek için kullanılan fonksiyon.
 * @returns {JSX.Element} Render edilmiş campaign yönetim bileşeni.
 */
const CampaignManagement = ({
  campaigns,
  dlcs,
  currentCampaign,
  onCampaignChange,
  onDlcChange,
  onSaveCampaign,
  onEditCampaign,
  onDeleteCampaign,
  onAddSubCampaign,
  onNewCampaign,
  onImport,
  selectedGame,
  onBack,
}) => {
  /**
   * Yalnızca ana (üstü olmayan) campaign'leri filtreler.
   * @returns {Array} Ana campaign'lerin listesi.
   */
  const getMainCampaigns = () => {
    if (!campaigns) return [];
    return campaigns.filter((c) => !c.parentId);
  };

  return (
    <div className="space-y-6" data-ers="add-game-modal.campaign-management">
      <CampaignHeader
        campaigns={campaigns}
        selectedGame={selectedGame}
        onBack={onBack}
      />

      <CampaignTools
        onImport={onImport}
        onGeneratePrompt={() => {
          /* Gelecekteki özellik için yer tutucu */
        }}
        onNewCampaign={onNewCampaign}
        selectedGame={selectedGame}
      />

      <CampaignForm
        currentCampaign={currentCampaign}
        setCurrentCampaign={onCampaignChange} // State'i doğrudan yönetmek yerine callback kullanılır
        mainCampaigns={getMainCampaigns()}
        onSave={onSaveCampaign}
      />

      <CampaignList
        campaigns={campaigns}
        onEdit={onEditCampaign}
        onAddSub={onAddSubCampaign}
        onDelete={onDeleteCampaign}
        // setCampaigns prop'u kaldırıldı, çünkü state yönetimi artık burada değil.
      />
    </div>
  );
};

export default CampaignManagement;

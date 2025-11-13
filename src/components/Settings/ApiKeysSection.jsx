import React, { useState } from "react";
import { Card, Button, InputField } from "../ui";
import { apiKeyService } from "../../services/apiKeys";

/**
 * ApiKeysSection — API anahtarlarının listelenmesi, oluşturulması, düzenlenmesi ve silinmesi.
 * Props ile gelen listeyi gösterir ve işlemler sonrası `loadApiKeys` çağrısı ile veriyi tazeler.
 * @param {object} props
 * @param {Array} [props.apiKeys] - Kayıtlı API anahtarları listesi
 * @param {function} [props.loadApiKeys] - Listeyi yeniden yükleme fonksiyonu
 * @returns {JSX.Element}
 */
export default function ApiKeysSection({ apiKeys = [], loadApiKeys }) {
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  const [operationStatus, setOperationStatus] = useState(null);
  const [newKey, setNewKey] = useState({
    serviceName: "",
    keyName: "",
    keyValue: "",
    isGlobal: false,
    metadata: {},
  });

  const resetForm = () => {
    setEditingKey(null);
    setNewKey({ serviceName: "", keyName: "", keyValue: "", isGlobal: false, metadata: {} });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  /**
   * API anahtarı kaydetme/düzenleme işlemini gerçekleştirir.
   */
  const handleSave = async () => {
    if (!newKey.serviceName.trim() || !newKey.keyName.trim() || !newKey.keyValue.trim()) {
      setOperationStatus({ success: false, message: "Lütfen tüm alanları doldurun." });
      return;
    }
    setIsWorking(true);
    setOperationStatus(null);
    try {
      if (editingKey) {
        await apiKeyService.updateApiKey(editingKey.id, {
          serviceName: newKey.serviceName,
          keyName: newKey.keyName,
          keyValue: newKey.keyValue,
          isGlobal: newKey.isGlobal,
          metadata: newKey.metadata,
        });
        setOperationStatus({ success: true, message: "API anahtarı güncellendi." });
      } else {
        await apiKeyService.createApiKey({
          serviceName: newKey.serviceName,
          keyName: newKey.keyName,
          keyValue: newKey.keyValue,
          isGlobal: newKey.isGlobal,
          metadata: newKey.metadata,
        });
        setOperationStatus({ success: true, message: "API anahtarı eklendi." });
      }
      closeModal();
      loadApiKeys && loadApiKeys();
    } catch (err) {
      if (String(err?.message || "").toLowerCase().includes("already")) {
        setOperationStatus({
          success: false,
          message: `${newKey.serviceName} servisi için zaten bir API anahtarı mevcut. Mevcut anahtarı düzenlemek için listeden seçin.`,
        });
      } else {
        setOperationStatus({ success: false, message: err?.message || "İşlem sırasında bir hata oluştu." });
      }
    } finally {
      setIsWorking(false);
    }
  };

  /**
   * Düzenleme moduna geçer ve formu doldurur.
   * @param {object} apiKey
   */
  const handleEdit = (apiKey) => {
    setEditingKey(apiKey);
    setNewKey({
      serviceName: apiKey.serviceName || "",
      keyName: apiKey.keyName || "",
      keyValue: apiKey.keyValue || "",
      isGlobal: !!apiKey.isGlobal,
      metadata: apiKey.metadata || {},
    });
    setShowModal(true);
  };

  /**
   * API anahtarını siler ve listeyi tazeler.
   * @param {string} keyId
   */
  const handleDelete = async (keyId) => {
    setIsWorking(true);
    setOperationStatus(null);
    try {
      await apiKeyService.deleteApiKey(keyId);
      setOperationStatus({ success: true, message: "API anahtarı silindi." });
      loadApiKeys && loadApiKeys();
    } catch (err) {
      setOperationStatus({ success: false, message: err?.message || "Silme işlemi başarısız." });
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">🔑 API Anahtar Yönetimi</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => loadApiKeys && loadApiKeys()} disabled={!loadApiKeys} data-ers="settings.api-keys.refresh">
            Yenile
          </Button>
          <Button size="sm" variant="primary" onClick={openCreateModal} data-ers="settings.api-keys.new-button">
            + Yeni API Anahtarı
          </Button>
        </div>
      </div>

      {operationStatus && (
        <div
          className={`p-3 rounded-[12px] text-sm mb-3 ${
            operationStatus.success
              ? "bg-green-500/20 text-green-700 border border-green-500/30"
              : "bg-red-500/20 text-red-700 border border-red-500/30"
          }`}
        >
          {operationStatus.message}
        </div>
      )}

      <div className="bg-[#EEEAE4] rounded-[16px] p-4 text-[#2D2A26] shadow-[5px_5px_10px_rgba(0,0,0,0.1),_-5px_-5px_10px_rgba(255,255,255,0.7)]">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-semibold">Kayıtlı API Anahtarları</h5>
          {isWorking && <span className="text-[#6B6661] text-sm">İşlem yapılıyor...</span>}
        </div>

        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-[#6B6661]">
            <div className="text-4xl mb-2">🔑</div>
            <p>Henüz kayıtlı API anahtarı bulunmuyor.</p>
            <p className="text-sm mt-1">Yeni bir API anahtarı eklemek için yukarıdaki butonu kullanın.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="bg-[#EEEAE4] rounded-[12px] p-3 border border-[#e2ddd7]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h6 className="font-semibold">{apiKey.serviceName}</h6>
                      <span className="text-sm text-[#6B6661]">•</span>
                      <span className="text-sm">{apiKey.keyName}</span>
                      {apiKey.isGlobal && (
                        <span className="px-2 py-1 bg-[#D97757]/20 text-[#D97757] text-xs rounded-full">Global</span>
                      )}
                    </div>
                    <div className="text-sm text-[#6B6661]">
                      <span className="font-mono bg-[#e7e3dd] px-2 py-1 rounded">
                        {typeof apiKey.keyValue === "string" ? `${apiKey.keyValue.slice(0, 20)}...` : "—"}
                      </span>
                    </div>
                    <div className="text-xs text-[#6B6661] mt-2">
                      Oluşturulma: {apiKey.createdAt ? new Date(apiKey.createdAt).toLocaleString("tr-TR") : "—"}
                      {apiKey.updatedAt && apiKey.updatedAt !== apiKey.createdAt && (
                        <span> • Güncelleme: {new Date(apiKey.updatedAt).toLocaleString("tr-TR")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(apiKey)} data-ers={`settings.api-keys.edit-button.${apiKey.id}`}>✏️ Düzenle</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(apiKey.id)} disabled={isWorking} data-ers={`settings.api-keys.delete-button.${apiKey.id}`}>🗑️ Sil</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#EEEAE4] rounded-[16px] p-4 w-full max-w-md shadow-[5px_5px_10px_rgba(0,0,0,0.1),_-5px_-5px_10px_rgba(255,255,255,0.7)]">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-[#2D2A26] font-semibold">
                {editingKey ? "API Anahtarını Düzenle" : "Yeni API Anahtarı Ekle"}
              </h5>
              <Button size="sm" variant="ghost" onClick={closeModal} data-ers="settings.api-keys.modal.close-button">✕</Button>
            </div>

            <div className="space-y-2">
              <InputField
                label="Servis Adı"
                placeholder="Örn: IGDB, Steam, OpenAI"
                value={newKey.serviceName}
                onChange={(e) => setNewKey({ ...newKey, serviceName: e.target.value })}
              />
              <InputField
                label="Anahtar Adı"
                placeholder="Örn: client_id, api_key, access_token"
                value={newKey.keyName}
                onChange={(e) => setNewKey({ ...newKey, keyName: e.target.value })}
              />
              <InputField
                multiline
                label="Anahtar Değeri"
                placeholder="API anahtarınızı buraya girin"
                value={newKey.keyValue}
                onChange={(e) => setNewKey({ ...newKey, keyValue: e.target.value })}
              />

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="isGlobal"
                  checked={newKey.isGlobal}
                  onChange={(e) => setNewKey({ ...newKey, isGlobal: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isGlobal" className="text-sm text-[#2D2A26]">Global anahtar (tüm kullanıcılar için)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button fullWidth onClick={handleSave} loading={isWorking} data-ers="settings.api-keys.modal.save-button">
                  {editingKey ? "Güncelle" : "Kaydet"}
                </Button>
                <Button fullWidth variant="secondary" onClick={closeModal} disabled={isWorking} data-ers="settings.api-keys.modal.cancel-button">
                  İptal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

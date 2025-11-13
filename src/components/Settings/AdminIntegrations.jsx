import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/AuthContext";
import { apiKeyService } from "../../services/apiKeys";

function StatusBadge({ status }) {
  if (!status) return null;
  const ok = status.success;
  const cls = ok
    ? "bg-green-500/20 text-green-400"
    : "bg-red-500/20 text-red-400";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {ok ? "✅ Bağlı" : "❌ Bağlantı Hatası"}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.shape({
    success: PropTypes.bool,
    message: PropTypes.string,
  }),
};

export default function AdminIntegrations() {
  const { user, isAdmin } = useAuth();

  const [steamApiKey, setSteamApiKey] = useState("");
  const [steamConnectionStatus, setSteamConnectionStatus] = useState(null);
  const [isTestingSteamConnection, setIsTestingSteamConnection] =
    useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const key = await apiKeyService.getSteamApiKey(user?.id);
        if (mounted) setSteamApiKey(key || "");
      } catch (err) {
        if (mounted) setSteamApiKey("");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleSaveSteamApiKey = async () => {
    if (!steamApiKey.trim()) {
      alert("Lütfen Steam API anahtarını girin");
      return;
    }
    try {
      await apiKeyService.setSteamApiKey(
        steamApiKey.trim(),
        user?.id,
        isAdmin,
      );
      setSteamConnectionStatus({
        success: true,
        message: "Steam API anahtarı kaydedildi",
      });
    } catch (error) {
      console.error("Failed to save Steam API key:", error);
      setSteamConnectionStatus({
        success: false,
        message: "Steam API anahtarı kaydedilemedi: " + error.message,
      });
    }
  };

  const handleTestSteamConnection = async () => {
    setIsTestingSteamConnection(true);
    setSteamConnectionStatus(null);
    try {
      const key = await apiKeyService.getSteamApiKey(user?.id);
      if (key && key.length > 10) {
        setSteamConnectionStatus({
          success: true,
          message: "Steam bağlantısı başarılı",
        });
      } else {
        setSteamConnectionStatus({
          success: false,
          message: "Steam bağlantısı başarısız: Key bulunamadı",
        });
      }
    } catch (error) {
      setSteamConnectionStatus({
        success: false,
        message: `Bağlantı hatası: ${error.message}`,
      });
    } finally {
      setIsTestingSteamConnection(false);
    }
  };

  const handleClearSteamCredentials = async () => {
    if (
      !window.confirm(
        "Steam API anahtarını silmek istediğinizden emin misiniz?",
      )
    )
      return;
    try {
      const res = await apiKeyService.getServiceApiKey(
        "steam",
        user?.id,
        false,
      );
      const keyId = res?.data?.id;
      if (keyId) {
        await apiKeyService.deleteApiKey(keyId);
      }
      setSteamApiKey("");
      setSteamConnectionStatus({
        success: true,
        message: "Steam API anahtarı başarıyla silindi",
      });
    } catch (error) {
      console.error("Failed to delete Steam API key:", error);
      setSteamConnectionStatus({
        success: false,
        message: "Steam API anahtarı silinemedi: " + error.message,
      });
    }
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-white font-medium flex items-center gap-2">
          🎮 Steam API Yönetimi
        </h5>
        <StatusBadge status={steamConnectionStatus} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Steam API Key
          </label>
          <input
            type="password"
            value={steamApiKey}
            onChange={(e) => setSteamApiKey(e.target.value)}
            placeholder={
              steamApiKey
                ? "Steam API anahtarınızı girin"
                : "🔍 Key bulunamadı - Steam API anahtarınızı girin"
            }
            className="w-full px-3 py-2 bg-gray-600/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveSteamApiKey}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            💾 Kaydet
          </button>
          <button
            onClick={handleTestSteamConnection}
            disabled={isTestingSteamConnection}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isTestingSteamConnection
              ? "⏳ Test Ediliyor..."
              : "🔍 Bağlantıyı Test Et"}
          </button>
          <button
            onClick={handleClearSteamCredentials}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🗑️ Temizle
          </button>
        </div>

        {steamConnectionStatus && (
          <div
            className={`p-3 rounded-lg text-sm ${steamConnectionStatus.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
          >
            {steamConnectionStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}

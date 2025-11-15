import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/AuthContext";
import { apiKeyService } from "../../services/apiKeys";
import { Button, InputField } from "../ui";

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

  // Steam States
  const [steamApiKey, setSteamApiKey] = useState("");
  const [steamConnectionStatus, setSteamConnectionStatus] = useState(null);
  const [isTestingSteamConnection, setIsTestingSteamConnection] =
    useState(false);

  // IGDB States
  const [igdbApiKey, setIgdbApiKey] = useState("");
  const [igdbConnectionStatus, setIgdbConnectionStatus] = useState(null);
  const [isTestingIgdbConnection, setIsTestingIgdbConnection] =
    useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchKeys = async () => {
      try {
        const steamKey = await apiKeyService.getSteamApiKey(user?.id);
        const igdbKey = await apiKeyService.getIgdbApiKey(user?.id);
        if (mounted) {
          setSteamApiKey(steamKey || "");
          setIgdbApiKey(igdbKey || "");
        }
      } catch (err) {
        if (mounted) {
          setSteamApiKey("");
          setIgdbApiKey("");
        }
      }
    };
    fetchKeys();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Steam Handlers
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
      await apiKeyService.deleteApiKeyForService("steam", user?.id);
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

  // IGDB Handlers
  const handleSaveIgdbApiKey = async () => {
    if (!igdbApiKey.trim()) {
      alert("Lütfen IGDB API anahtarını girin");
      return;
    }
    try {
      await apiKeyService.setIgdbApiKey(
        igdbApiKey.trim(),
        user?.id,
        isAdmin,
      );
      setIgdbConnectionStatus({
        success: true,
        message: "IGDB API anahtarı kaydedildi",
      });
    } catch (error) {
      console.error("Failed to save IGDB API key:", error);
      setIgdbConnectionStatus({
        success: false,
        message: "IGDB API anahtarı kaydedilemedi: " + error.message,
      });
    }
  };

  const handleTestIgdbConnection = async () => {
    setIsTestingIgdbConnection(true);
    setIgdbConnectionStatus(null);
    try {
      const key = await apiKeyService.getIgdbApiKey(user?.id);
      if (key && key.length > 10) {
        setIgdbConnectionStatus({
          success: true,
          message: "IGDB bağlantısı başarılı",
        });
      } else {
        setIgdbConnectionStatus({
          success: false,
          message: "IGDB bağlantısı başarısız: Key bulunamadı",
        });
      }
    } catch (error) {
      setIgdbConnectionStatus({
        success: false,
        message: `Bağlantı hatası: ${error.message}`,
      });
    } finally {
      setIsTestingIgdbConnection(false);
    }
  };

  const handleClearIgdbCredentials = async () => {
    if (
      !window.confirm(
        "IGDB API anahtarını silmek istediğinizden emin misiniz?",
      )
    )
      return;
    try {
      await apiKeyService.deleteApiKeyForService("igdb", user?.id);
      setIgdbApiKey("");
      setIgdbConnectionStatus({
        success: true,
        message: "IGDB API anahtarı başarıyla silindi",
      });
    } catch (error) {
      console.error("Failed to delete IGDB API key:", error);
      setIgdbConnectionStatus({
        success: false,
        message: "IGDB API anahtarı silinemedi: " + error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Steam Section */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-white font-medium flex items-center gap-2">
            🎮 Steam API Yönetimi
          </h5>
          <StatusBadge status={steamConnectionStatus} />
        </div>
        <div className="space-y-4">
          <InputField
            label="Steam API Key"
            type="password"
            value={steamApiKey}
            onChange={(e) => setSteamApiKey(e.target.value)}
            placeholder={
              steamApiKey
                ? "Steam API anahtarınızı girin"
                : "🔍 Key bulunamadı - Steam API anahtarınızı girin"
            }
          />
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleSaveSteamApiKey}>
              💾 Kaydet
            </Button>
            <Button
              variant="secondary"
              onClick={handleTestSteamConnection}
              loading={isTestingSteamConnection}
              disabled={isTestingSteamConnection}
            >
              {isTestingSteamConnection
                ? "⏳ Test Ediliyor..."
                : "🔍 Bağlantıyı Test Et"}
            </Button>
            <Button variant="danger" onClick={handleClearSteamCredentials}>
              🗑️ Temizle
            </Button>
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

      {/* IGDB Section */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-white font-medium flex items-center gap-2">
            📚 IGDB API Yönetimi
          </h5>
          <StatusBadge status={igdbConnectionStatus} />
        </div>
        <div className="space-y-4">
          <InputField
            label="IGDB API Key"
            type="password"
            value={igdbApiKey}
            onChange={(e) => setIgdbApiKey(e.target.value)}
            placeholder={
              igdbApiKey
                ? "IGDB API anahtarınızı girin"
                : "🔍 Key bulunamadı - IGDB API anahtarınızı girin"
            }
          />
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleSaveIgdbApiKey}>
              💾 Kaydet
            </Button>
            <Button
              variant="secondary"
              onClick={handleTestIgdbConnection}
              loading={isTestingIgdbConnection}
              disabled={isTestingIgdbConnection}
            >
              {isTestingIgdbConnection
                ? "⏳ Test Ediliyor..."
                : "🔍 Bağlantıyı Test Et"}
            </Button>
            <Button variant="danger" onClick={handleClearIgdbCredentials}>
              🗑️ Temizle
            </Button>
          </div>
          {igdbConnectionStatus && (
            <div
              className={`p-3 rounded-lg text-sm ${igdbConnectionStatus.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
            >
              {igdbConnectionStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

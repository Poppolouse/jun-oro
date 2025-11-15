import React, { useEffect, useState } from "react";
import { Card, Button } from "../ui";
import useSettingsData from "../../hooks/useSettingsData";

/**
 * R2StorageSection — R2 Depolama yönetimi UI'ı.
 * Hook'tan r2Stats verisini yükler, bağlantı testi ve hızlı işlemleri sağlar.
 * @returns {JSX.Element} R2 depolama yönetim alanı
 */
export default function R2StorageSection() {
  const settings = useSettingsData();
  const r2Stats = settings?.r2Stats || null;

  const [isLoadingR2Stats, setIsLoadingR2Stats] = useState(false);
  const [isTestingR2Connection, setIsTestingR2Connection] = useState(false);
  const [r2ConnectionStatus, setR2ConnectionStatus] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoadingR2Stats(true);
      try {
        await settings?.loadR2Stats?.();
      } finally {
        if (mounted) setIsLoadingR2Stats(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [settings?.loadR2Stats]);

  const testConnection = async () => {
    setIsTestingR2Connection(true);
    setR2ConnectionStatus(null);
    try {
      const res = await settings?.testR2Connection?.();
      if (res?.success) {
        setR2ConnectionStatus({ success: true, message: res.message || "R2 bağlantısı başarılı!", data: res.data });
      } else {
        setR2ConnectionStatus({ success: false, message: res?.message || res?.error || "R2 bağlantı testi başarısız" });
      }
    } catch (err) {
      setR2ConnectionStatus({ success: false, message: `R2 bağlantı testi sırasında hata: ${err.message}` });
    } finally {
      setIsTestingR2Connection(false);
    }
  };

  const reloadStats = async () => {
    setIsLoadingR2Stats(true);
    try {
      await settings?.loadR2Stats?.();
    } finally {
      setIsLoadingR2Stats(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">☁️ R2 Depolama Yönetimi</h4>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400">Aktif</span>
        </div>
      </div>

      {/* Yapılandırma Durumu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h5 className="text-white font-medium mb-4 flex items-center gap-2">
            <span className="text-lg">🔧</span>
            Yapılandırma Durumu
          </h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Account ID:</span>
              <span className="text-green-400 font-mono text-sm">✓ Yapılandırıldı</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Access Key:</span>
              <span className="text-green-400 font-mono text-sm">✓ Yapılandırıldı</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Secret Key:</span>
              <span className="text-green-400 font-mono text-sm">✓ Yapılandırıldı</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Bucket Name:</span>
              <span className="text-white font-mono text-sm">{r2ConnectionStatus?.data?.bucketName || "jun-oro-storage"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Public URL:</span>
              <span className="text-blue-400 font-mono text-sm truncate">{r2ConnectionStatus?.data?.publicUrl || "https://pub-*.r2.dev"}</span>
            </div>
            {r2ConnectionStatus && (
              <div className={`mt-4 p-3 rounded ${r2ConnectionStatus.success ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"}`}>
                <div className={`text-sm ${r2ConnectionStatus.success ? "text-green-300" : "text-red-300"}`}>{r2ConnectionStatus.message}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-6">
          <h5 className="text-white font-medium mb-4 flex items-center gap-2">
            <span className="text-lg">📊</span>
            Depolama İstatistikleri
            {isLoadingR2Stats && (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin ml-2"></div>
            )}
          </h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Toplam Dosya:</span>
              <span className="text-white font-mono">{r2Stats ? r2Stats.totalFiles.toLocaleString() : "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Kullanılan Alan:</span>
              <span className="text-white font-mono">{r2Stats ? r2Stats.totalSizeFormatted : "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Son Yükleme:</span>
              <span className="text-gray-400 text-sm">{r2Stats && r2Stats.recentFiles?.length > 0 ? new Date(r2Stats.recentFiles[0].lastModified).toLocaleDateString("tr-TR") : "-"}</span>
            </div>
            {r2Stats && r2Stats.fileTypes && Object.keys(r2Stats.fileTypes).length > 0 && (
              <div className="mt-4 p-3 bg-gray-600/30 rounded">
                <div className="text-sm text-gray-300 mb-2">Dosya Türleri:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(r2Stats.fileTypes).map(([type, count]) => (
                    <span key={type} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                      {type.toUpperCase()}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-600/30 rounded">💡 İstatistikler R2 API'sinden gerçek zamanlı olarak alınıyor</div>
          </div>
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="bg-gray-700/50 rounded-lg p-6" data-ers="settings.r2-storage.quick-actions">
        <h5 className="text-white font-medium mb-4 flex items-center gap-2">
          <span className="text-lg">⚡</span>
          Hızlı İşlemler
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            fullWidth
            variant="primary"
            onClick={testConnection}
            loading={isTestingR2Connection}
            className="text-left"
            data-ers="settings.r2-storage.quick-actions.test-connection"
          >
            <div className="text-2xl mb-2">{isTestingR2Connection ? "⏳" : "🧪"}</div>
            <div className="font-medium">{isTestingR2Connection ? "Test Ediliyor..." : "Bağlantı Testi"}</div>
            <div className="text-sm text-slate-400 mt-1">R2 bağlantısını test et</div>
          </Button>

          <Button
            fullWidth
            variant="secondary"
            onClick={reloadStats}
            loading={isLoadingR2Stats}
            className="text-left"
            data-ers="settings.r2-storage.quick-actions.refresh-stats"
          >
            <div className="text-2xl mb-2">{isLoadingR2Stats ? "⏳" : "🔄"}</div>
            <div className="font-medium">{isLoadingR2Stats ? "Yenileniyor..." : "İstatistikleri Yenile"}</div>
            <div className="text-sm text-slate-400 mt-1">Depolama verilerini güncelle</div>
          </Button>

          <Button fullWidth variant="ghost" className="text-left" data-ers="settings.r2-storage.quick-actions.clear-cache">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-medium">Cache Temizle</div>
            <div className="text-sm text-slate-400 mt-1">R2 cache'ini temizle</div>
          </Button>
        </div>
      </div>

      {/* Son Aktiviteler */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h5 className="text-white font-medium mb-4 flex items-center gap-2">
          <span className="text-lg">📋</span>
          Son Aktiviteler
        </h5>
        <div className="space-y-3">
          {r2Stats?.recentFiles && r2Stats.recentFiles.length > 0 ? (
            r2Stats.recentFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-600/30 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-white text-sm flex items-center gap-2">
                    <span>📄</span>
                    {file.key}
                  </div>
                  <div className="text-gray-400 text-xs flex items-center gap-4">
                    <span>Boyut: {file.size}</span>
                    <span>
                      Son değişiklik: {new Date(file.lastModified).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400">
              {isLoadingR2Stats ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Aktiviteler yükleniyor...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl mb-2">📁</div>
                  <p className="text-sm">Henüz R2 aktivitesi bulunmuyor</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

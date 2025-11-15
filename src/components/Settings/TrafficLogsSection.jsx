import React, { useEffect, useMemo, useState } from "react";
import { Card, Button } from "../ui";
import useSettingsData from "../../hooks/useSettingsData";

/**
 * TrafficLogsSection — Trafik loglarını gösterir ve filtreler.
 * Kaynak: useSettingsData (trafficLogs, loadTrafficLogs)
 */
export default function TrafficLogsSection() {
  const settings = useSettingsData();
  const trafficLogs = settings?.trafficLogs || [];

  const [trafficFilter, setTrafficFilter] = useState("all");
  const [trafficDateRange, setTrafficDateRange] = useState("today");

  useEffect(() => {
    if (typeof settings?.loadTrafficLogs === "function") {
      settings.loadTrafficLogs();
    }
  }, [settings?.loadTrafficLogs]);

  const filteredLogs = useMemo(() => {
    let filtered = trafficLogs;
    if (trafficFilter !== "all") {
      filtered = filtered.filter((log) => log.action === trafficFilter);
    }
    const now = new Date();
    if (trafficDateRange === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter((log) => new Date(log.timestamp) >= today);
    } else if (trafficDateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= weekAgo);
    } else if (trafficDateRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= monthAgo);
    }
    return filtered;
  }, [trafficLogs, trafficFilter, trafficDateRange]);

  const totalActivities = filteredLogs.length;
  const activeUsers = useMemo(
    () => new Set(filteredLogs.map((l) => l.userId)).size,
    [filteredLogs],
  );
  const loginCount = useMemo(
    () => filteredLogs.filter((l) => l.action === "login").length,
    [filteredLogs],
  );
  const avgDuration = useMemo(() => {
    if (filteredLogs.length === 0) return 0;
    const sum = filteredLogs.reduce((acc, l) => acc + (l.duration || 0), 0);
    return Math.round(sum / filteredLogs.length);
  }, [filteredLogs]);

  const getActionIcon = (action) => {
    const actionIcons = {
      login: "🔓",
      logout: "🔒",
      page_view: "👁️",
      game_add: "➕",
      game_remove: "➖",
      search: "🔍",
      profile_update: "✏️",
    };
    return actionIcons[action] || "📝";
  };

  const getActionDisplayName = (action) => {
    const actionNames = {
      login: "Giriş",
      logout: "Çıkış",
      page_view: "Sayfa Görüntüleme",
      game_add: "Oyun Ekleme",
      game_remove: "Oyun Silme",
      search: "Arama",
      profile_update: "Profil Güncelleme",
    };
    return actionNames[action] || action;
  };

  return (
    <Card className="p-6" data-ers="admin.traffic">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">🚦 Trafik Logları</h2>
        <Button size="sm" variant="secondary" onClick={() => settings.loadTrafficLogs?.()}>
          🔄 Yenile
        </Button>
      </div>

      {/* Filtreler */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 mb-6">
        <h5 className="text-white font-medium mb-3 flex items-center gap-2">🔍 Filtreler</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Aksiyon Türü</label>
            <select
              value={trafficFilter}
              onChange={(e) => setTrafficFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white"
            >
              <option value="all">Tümü</option>
              <option value="login">Giriş</option>
              <option value="logout">Çıkış</option>
              <option value="page_view">Sayfa Görüntüleme</option>
              <option value="game_add">Oyun Ekleme</option>
              <option value="game_remove">Oyun Silme</option>
              <option value="search">Arama</option>
              <option value="profile_update">Profil Güncelleme</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Zaman Aralığı</label>
            <select
              value={trafficDateRange}
              onChange={(e) => setTrafficDateRange(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white"
            >
              <option value="today">Bugün</option>
              <option value="week">Son 7 Gün</option>
              <option value="month">Son 30 Gün</option>
              <option value="all">Tümü</option>
            </select>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalActivities}</div>
            <div className="text-slate-300 text-sm">Toplam Aktivite</div>
          </div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{activeUsers}</div>
            <div className="text-slate-300 text-sm">Aktif Kullanıcı</div>
          </div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{loginCount}</div>
            <div className="text-slate-300 text-sm">Giriş Sayısı</div>
          </div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{avgDuration || 0}s</div>
            <div className="text-slate-300 text-sm">Ort. Oturum Süresi</div>
          </div>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
        <h5 className="text-white font-medium mb-3 flex items-center gap-2">📋 Detaylı Trafik Logları</h5>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Zaman</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Kullanıcı</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Aksiyon</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Sayfa</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">IP Adresi</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Tarayıcı</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Süre</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice(0, 50).map((log) => (
                <tr key={log.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="py-3 px-4 text-slate-400 text-sm">
                    {new Date(log.timestamp).toLocaleString("tr-TR")}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {(log.username || "")[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <span className="text-white font-medium">{log.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getActionIcon(log.action)}</span>
                      <span className="text-white">{getActionDisplayName(log.action)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-sm">{log.page}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-sm">{log.ip}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{log.userAgent}</td>
                  <td className="py-3 px-4 text-blue-400 font-medium">{log.duration}s</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              Seçilen filtrelere uygun trafik kaydı bulunamadı
            </div>
          )}
        </div>

        {filteredLogs.length > 50 && (
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-sm">
              Toplam {filteredLogs.length} kayıt bulundu, ilk 50 tanesi gösteriliyor.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

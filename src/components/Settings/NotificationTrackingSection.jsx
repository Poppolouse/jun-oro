import React, { useEffect, useMemo, useState, useCallback } from "react";
import useSettingsData from "../../hooks/useSettingsData";
import { Button } from "../ui";

/**
 * Shows notification tracking stats and per-user read details.
 * Pulls data from useSettingsData and computes stats locally from localStorage.
 * @returns {JSX.Element} Notification tracking section
 */
export default function NotificationTrackingSection() {
  const {
    users = [],
    notificationHistory = [],
    userReadStats = {},
    loadNotificationHistory,
    loadUserReadStats,
  } = useSettingsData();

  const [notificationStats, setNotificationStats] = useState({});
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  const computeNotificationStats = useCallback(() => {
    try {
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]",
      );
      const stats = {};
      notifications.forEach((notification) => {
        const totalUsers = users.length;
        let readCount = 0;
        users.forEach((user) => {
          const userReadStatus = JSON.parse(
            localStorage.getItem(`notificationReadStatus_${user.id}`) || "{}",
          );
          if (userReadStatus[notification.id]) readCount += 1;
        });
        stats[notification.id] = {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          timestamp: notification.timestamp,
          readCount,
          totalUsers,
          unreadCount: Math.max(totalUsers - readCount, 0),
          readPercentage:
            totalUsers > 0 ? Math.round((readCount / totalUsers) * 100) : 0,
        };
      });
      setNotificationStats(stats);
    } catch (error) {
      console.error("computeNotificationStats error", error);
      setNotificationStats({});
    }
  }, [users]);

  useEffect(() => {
    // Load history and compute stats on mount and when users change
    loadNotificationHistory && loadNotificationHistory();
    computeNotificationStats();
  }, [loadNotificationHistory, computeNotificationStats]);

  const onRefresh = () => {
    loadNotificationHistory && loadNotificationHistory();
    computeNotificationStats();
  };

  const totalNotifications = useMemo(
    () => Object.keys(notificationStats).length,
    [notificationStats],
  );

  const avgReadPercentage = useMemo(() => {
    if (totalNotifications === 0) return 0;
    const sum = Object.values(notificationStats).reduce(
      (acc, s) => acc + (s.readPercentage || 0),
      0,
    );
    return Math.round(sum / totalNotifications);
  }, [notificationStats, totalNotifications]);

  const totalUnread = useMemo(() => {
    return Object.values(notificationStats).reduce(
      (acc, s) => acc + (s.unreadCount || 0),
      0,
    );
  }, [notificationStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">📊 Bildirim Takip Sistemi</h4>
        <Button size="sm" variant="secondary" onClick={onRefresh} data-ers="settings.notification-tracking.refresh-button">🔄 Yenile</Button>
      </div>

      {/* Bildirim İstatistikleri Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {totalNotifications}
            </div>
            <div className="text-gray-400 text-sm">Toplam Bildirim</div>
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{avgReadPercentage}%</div>
            <div className="text-gray-400 text-sm">Ortalama Okunma</div>
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{users.length}</div>
            <div className="text-gray-400 text-sm">Aktif Kullanıcı</div>
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{totalUnread}</div>
            <div className="text-gray-400 text-sm">Okunmamış Toplam</div>
          </div>
        </div>
      </div>

      {/* Bildirim Listesi */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h5 className="text-white font-medium mb-4 flex items-center gap-2">📋 Bildirim Detayları</h5>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Bildirim</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Tip</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Gönderilme</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Okunma Oranı</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(notificationStats).map((stat) => (
                <tr key={stat.id} className="border-b border-gray-700/50 hover:bg-gray-600/20">
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-white font-medium">{stat.title}</div>
                      <div className="text-gray-400 text-sm truncate max-w-xs">{stat.message}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        stat.type === "info"
                          ? "bg-blue-500/20 text-blue-400"
                          : stat.type === "success"
                          ? "bg-green-500/20 text-green-400"
                          : stat.type === "warning"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : stat.type === "error"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {stat.type === "info" && "ℹ️ Bilgi"}
                      {stat.type === "success" && "✅ Başarı"}
                      {stat.type === "warning" && "⚠️ Uyarı"}
                      {stat.type === "error" && "❌ Hata"}
                      {stat.type === "announcement" && "📢 Duyuru"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">
                    {new Date(stat.timestamp).toLocaleString("tr-TR")}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            stat.readPercentage >= 80
                              ? "bg-green-500"
                              : stat.readPercentage >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${stat.readPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm font-medium min-w-[3rem]">
                        {stat.readCount}/{stat.totalUsers}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedNotificationId(stat.id);
                        loadUserReadStats && loadUserReadStats(stat.id);
                      }}
                      data-ers={`settings.notification-tracking.details-button.${stat.id}`}
                    >
                      Detay Gör
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {Object.keys(notificationStats).length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Henüz bildirim bulunmuyor. İstatistikleri yüklemek için "Yenile" butonuna tıklayın.
            </div>
          )}
        </div>
      </div>

      {/* Kullanıcı Detay Modal */}
      {selectedNotificationId && (
        <div className="bg-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-white font-medium flex items:center gap-2">👥 Kullanıcı Okuma Detayları</h5>
            <Button size="sm" variant="ghost" onClick={() => setSelectedNotificationId(null)} data-ers="settings.notification-tracking.modal.close-button">✕</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Kullanıcı</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Durum</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Okunma Zamanı</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(userReadStats).map((userStat) => (
                  <tr key={userStat.id} className="border-b border-gray-700/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{userStat.avatar}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{userStat.username}</div>
                          <div className="text-gray-400 text-sm">{userStat.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userStat.hasRead ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {userStat.hasRead ? "✅ Okundu" : "❌ Okunmadı"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {userStat.readAt ? new Date(userStat.readAt).toLocaleString("tr-TR") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

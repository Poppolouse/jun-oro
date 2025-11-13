import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import NotificationHistory from "./NotificationHistory";

export default function AdminNotifications({
  notificationTitle,
  notificationMessage,
  notificationType,
  setNotificationTitle,
  setNotificationMessage,
  setNotificationType,
  sendToAll,
  setSendToAll,
  selectedUsers,
  onUserSelection,
  onSelectAllUsers,
  isSendingNotification,
  onSendNotification,
  notificationHistory,
  users,
  setSelectedNotificationId,
  loadUserReadStats,
  userReadStats,
  selectedNotificationId,
}) {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const totalPages = Math.max(
    1,
    Math.ceil((notificationHistory?.length || 0) / pageSize),
  );
  const pagedHistory = useMemo(
    () =>
      (notificationHistory || []).slice(page * pageSize, (page + 1) * pageSize),
    [notificationHistory, page],
  );

  useEffect(() => {
    // reset page when history changes so we don't show an empty page
    if (page > 0 && (notificationHistory?.length || 0) <= page * pageSize) {
      setPage(0);
    }
  }, [notificationHistory, page, pageSize]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">
          📢 Bildirim Yönetimi
        </h4>
        <div className="text-sm text-gray-400">
          Tüm kullanıcılara bildirim gönder
        </div>
      </div>

      <div className="bg-gray-700/50 rounded-lg p-6">
        <h5 className="text-white font-medium mb-4">✉️ Yeni Bildirim Gönder</h5>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Başlık</label>
            <input
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Mesaj</label>
            <textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Bildirim Tipi
            </label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="info">Bilgi</option>
              <option value="success">Başarı</option>
              <option value="warning">Uyarı</option>
              <option value="error">Hata</option>
              <option value="announcement">Duyuru</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Alıcılar</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={sendToAll}
                  onChange={() => setSendToAll(true)}
                />
                <span className="text-gray-300">Tüm Kullanıcılar</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!sendToAll}
                  onChange={() => setSendToAll(false)}
                />
                <span className="text-gray-300">Seçili Kullanıcılar</span>
              </label>
            </div>

            {!sendToAll && (
              <div className="mt-3 p-3 bg-gray-800/50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">
                    Kullanıcı Seçimi
                  </span>
                  <button
                    onClick={onSelectAllUsers}
                    className="text-blue-400 text-sm"
                  >
                    {selectedUsers.length === users.length
                      ? "Hiçbirini Seçme"
                      : "Tümünü Seç"}
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {users.map((u) => (
                    <label key={u.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={() => onUserSelection(u.id)}
                      />
                      <span className="text-gray-300 text-sm">
                        {u.username}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={onSendNotification}
              disabled={
                isSendingNotification ||
                !notificationTitle.trim() ||
                !notificationMessage.trim()
              }
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {isSendingNotification ? "Gönderiliyor..." : "📤 Bildirim Gönder"}
            </button>
          </div>
        </div>
      </div>

      {notificationHistory && notificationHistory.length > 0 && (
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h5 className="text-white font-medium mb-4">
            📋 Gönderilen Bildirimler
          </h5>
          <NotificationHistory history={pagedHistory} />

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-400">
              Toplam: {notificationHistory.length} bildirim
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0}
                className="px-3 py-1 bg-gray-800 rounded text-white"
              >
                Önceki
              </button>
              <span className="text-sm text-gray-300">
                Sayfa {page + 1} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages - 1))
                }
                disabled={page + 1 >= totalPages}
                className="px-3 py-1 bg-gray-800 rounded text-white"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AdminNotifications.propTypes = {
  notificationTitle: PropTypes.string,
  notificationMessage: PropTypes.string,
  notificationType: PropTypes.string,
  setNotificationTitle: PropTypes.func,
  setNotificationMessage: PropTypes.func,
  setNotificationType: PropTypes.func,
  sendToAll: PropTypes.bool,
  setSendToAll: PropTypes.func,
  selectedUsers: PropTypes.array,
  onUserSelection: PropTypes.func,
  onSelectAllUsers: PropTypes.func,
  isSendingNotification: PropTypes.bool,
  onSendNotification: PropTypes.func,
  notificationHistory: PropTypes.array,
  users: PropTypes.array,
  setSelectedNotificationId: PropTypes.func,
  loadUserReadStats: PropTypes.func,
  userReadStats: PropTypes.object,
  selectedNotificationId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

AdminNotifications.defaultProps = {
  notificationTitle: "",
  notificationMessage: "",
  notificationType: "info",
  setNotificationTitle: () => {},
  setNotificationMessage: () => {},
  setNotificationType: () => {},
  sendToAll: true,
  setSendToAll: () => {},
  selectedUsers: [],
  onUserSelection: () => {},
  onSelectAllUsers: () => {},
  isSendingNotification: false,
  onSendNotification: () => {},
  notificationHistory: [],
  users: [],
  setSelectedNotificationId: () => {},
  loadUserReadStats: () => {},
  userReadStats: {},
  selectedNotificationId: null,
};

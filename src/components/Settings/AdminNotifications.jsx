import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, InputField } from "../ui";
import NotificationHistory from "./NotificationHistory";

export default function AdminNotifications({
  notificationTitle = "",
  notificationMessage = "",
  notificationType = "info",
  setNotificationTitle = () => {},
  setNotificationMessage = () => {},
  setNotificationType = () => {},
  sendToAll = true,
  setSendToAll = () => {},
  selectedUsers = [],
  onUserSelection = () => {},
  onSelectAllUsers = () => {},
  isSendingNotification = false,
  onSendNotification = () => {},
  notificationHistory = [],
  users = [],
  setSelectedNotificationId = () => {},
  loadUserReadStats = () => {},
  userReadStats = {},
  selectedNotificationId = null,
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
          <InputField
            label="Başlık"
            value={notificationTitle}
            onChange={(e) => setNotificationTitle(e.target.value)}
          />

          <InputField
            multiline
            label="Mesaj"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            rows={4}
          />

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Bildirim Tipi
            </label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onSelectAllUsers}
                  >
                    {selectedUsers.length === users.length
                      ? "Hiçbirini Seçme"
                      : "Tümünü Seç"}
                  </Button>
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
            <Button
              onClick={onSendNotification}
              disabled={
                isSendingNotification ||
                !notificationTitle.trim() ||
                !notificationMessage.trim()
              }
              variant="primary"
            >
              {isSendingNotification ? "Gönderiliyor..." : "Bildirim Gönder"}
            </Button>
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
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0}
              >
                Önceki
              </Button>
              <span className="text-sm text-gray-300">
                Sayfa {page + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages - 1))
                }
                disabled={page + 1 >= totalPages}
              >
                Sonraki
              </Button>
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

// defaultProps kaldırıldı; varsayılanlar artık fonksiyon parametrelerinde ayarlanıyor

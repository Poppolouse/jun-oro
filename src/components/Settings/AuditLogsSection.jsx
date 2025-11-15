import React, { useEffect, useState, useMemo } from "react";
import { Card, Button } from "../ui";

/**
 * AuditLogsSection — Admin Denetim Günlüğü
 * @param {Array} auditLogs - güncel denetim günlükleri listesi
 * @param {Object} auditLogsPagination - sayfalama bilgileri { currentPage, totalPages, totalItems, limit }
 * @param {Function} loadAuditLogs - belirli sayfa için denetim günlüklerini yükler
 * Bu bileşen, filtreleme ve sayfalama etkileşimlerini lokal state ile yönetir.
 */
export default function AuditLogsSection({
  auditLogs = [],
  auditLogsPagination,
  loadAuditLogs,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(auditLogsPagination?.currentPage || 1);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loadAuditLogs) return;
    let cancelled = false;
    const run = async () => {
      try {
        setIsLoading(true);
        await loadAuditLogs(page);
      } catch (e) {
        console.error("AuditLogsSection.loadAuditLogs", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [page, loadAuditLogs]);

  useEffect(() => {
    if (auditLogsPagination?.currentPage && auditLogsPagination.currentPage !== page) {
      setPage(auditLogsPagination.currentPage);
    }
  }, [auditLogsPagination?.currentPage]);

  const filteredAuditLogs = useMemo(() => {
    if (filter === "all") return auditLogs;
    return auditLogs.filter((log) =>
      String(log.action || "").toLowerCase().includes(filter.toLowerCase()),
    );
  }, [auditLogs, filter]);

  const formatAuditLogAction = (action) => {
    const actionMap = {
      CREATE_USER: "👤 Kullanıcı Oluşturma",
      UPDATE_USER: "✏️ Kullanıcı Güncelleme",
      DELETE_USER: "🗑️ Kullanıcı Silme",
      LOGIN: "🔐 Giriş",
      LOGOUT: "🚪 Çıkış",
      CREATE_CHANGELOG: "📝 Changelog Oluşturma",
      UPDATE_CHANGELOG: "📝 Changelog Güncelleme",
      DELETE_CHANGELOG: "🗑️ Changelog Silme",
    };
    return actionMap[action] || action;
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">🛡️ Admin Denetim Günlüğü</h4>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
          >
            <option value="all">Tüm Eylemler</option>
            <option value="create">Oluşturma</option>
            <option value="update">Güncelleme</option>
            <option value="delete">Silme</option>
            <option value="login">Giriş/Çıkış</option>
          </select>
          <Button size="sm" variant="secondary" onClick={() => loadAuditLogs && loadAuditLogs(page)} data-ers="settings.audit-logs.refresh-button">
            🔄 Yenile
          </Button>
        </div>
      </div>

      <div className="bg-gray-700/40 rounded-xl p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Denetim günlükleri yükleniyor...</p>
          </div>
        ) : filteredAuditLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Henüz denetim günlüğü bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAuditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{formatAuditLogAction(log.action)}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.success
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {log.success ? "✅ Başarılı" : "❌ Başarısız"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Admin:</span>
                        <span className="text-white ml-2">{log.admin?.username || "Bilinmiyor"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tarih:</span>
                        <span className="text-white ml-2">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString("tr-TR") : "Bilinmiyor"}
                        </span>
                      </div>
                      {log.targetType && (
                        <div>
                          <span className="text-gray-400">Hedef:</span>
                          <span className="text-white ml-2">{log.targetType}</span>
                          {log.targetName && (
                            <span className="text-gray-300 ml-1">({log.targetName})</span>
                          )}
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">IP:</span>
                        <span className="text-white ml-2">{log.ipAddress || "Bilinmiyor"}</span>
                      </div>
                    </div>

                    {log.details && (
                      <div className="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                        <span className="text-gray-400 text-sm">Detaylar:</span>
                        <pre className="text-gray-300 text-xs mt-1 whitespace-pre-wrap">
                          {typeof log.details === "string"
                            ? log.details
                            : JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}

                    {!log.success && log.errorMessage && (
                      <div className="mt-3 p-3 bg-red-900/20 rounded border border-red-700">
                        <span className="text-red-400 text-sm">Hata:</span>
                        <p className="text-red-300 text-sm mt-1">{log.errorMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {auditLogsPagination && auditLogsPagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400">
              Sayfa {auditLogsPagination.currentPage} / {auditLogsPagination.totalPages}(
              {auditLogsPagination.totalItems} kayıt)
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  loadAuditLogs && loadAuditLogs(Math.max(1, page - 1));
                }}
                disabled={page <= 1}
                data-ers="settings.audit-logs.pagination.prev"
              >
                ← Önceki
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const next = Math.min(
                    auditLogsPagination.totalPages,
                    page + 1,
                  );
                  setPage(next);
                  loadAuditLogs && loadAuditLogs(next);
                }}
                disabled={page >= auditLogsPagination.totalPages}
                data-ers="settings.audit-logs.pagination.next"
              >
                Sonraki →
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

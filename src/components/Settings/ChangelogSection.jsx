import React, { useEffect, useState } from "react";
import { Card, Button, InputField } from "../ui";
import useSettingsData from "../../hooks/useSettingsData";
import { useAuth } from "../../contexts/AuthContext";

/**
 * ChangelogSection — Changelog yönetimi (listeleme, ekleme/düzenleme/silme, modal).
 */
export default function ChangelogSection() {
  const settings = useSettingsData();
  const { user } = useAuth();

  const changelogs = settings?.changelogs || [];
  const [isLoadingChangelogs, setIsLoadingChangelogs] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [editingChangelog, setEditingChangelog] = useState(null);
  const [changelogOperationStatus, setChangelogOperationStatus] = useState(null);
  const [newChangelog, setNewChangelog] = useState({
    title: "",
    content: "",
    version: "",
    type: "update",
    isPublished: true,
    releaseDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoadingChangelogs(true);
        if (typeof settings?.loadChangelogs === "function") {
          await settings.loadChangelogs();
        }
      } finally {
        if (mounted) setIsLoadingChangelogs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [settings?.loadChangelogs]);

  const handleEditChangelog = (changelog) => {
    setEditingChangelog(changelog);
    setNewChangelog({
      title: changelog.title || "",
      content: changelog.content || "",
      version: changelog.version || "",
      type: changelog.type || "update",
      isPublished: Boolean(changelog.isPublished),
      releaseDate: changelog.releaseDate
        ? new Date(changelog.releaseDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setShowChangelogModal(true);
  };

  const handleCloseChangelogModal = () => {
    setShowChangelogModal(false);
    setEditingChangelog(null);
    setNewChangelog({
      title: "",
      content: "",
      version: "",
      type: "update",
      isPublished: true,
      releaseDate: new Date().toISOString().split("T")[0],
    });
    setChangelogOperationStatus(null);
  };

  const handleSaveChangelog = async () => {
    if (!newChangelog.title.trim() || !newChangelog.content.trim()) {
      setChangelogOperationStatus({ type: "error", message: "Başlık ve içerik gerekli" });
      return;
    }
    try {
      setChangelogOperationStatus("loading");
      const payload = { ...newChangelog, authorId: user?.id };
      const res = await settings.saveChangelog(payload, editingChangelog?.id || null);
      if (res?.success) {
        setChangelogOperationStatus({
          type: "success",
          message: editingChangelog ? "Changelog başarıyla güncellendi!" : "Changelog başarıyla oluşturuldu!",
        });
        handleCloseChangelogModal();
      } else {
        setChangelogOperationStatus({ type: "error", message: res?.error || "Changelog kaydedilemedi" });
      }
    } catch (err) {
      console.error("Changelog kaydetme hatası (section):", err);
      setChangelogOperationStatus({ type: "error", message: "Changelog kaydedilemedi" });
    }
  };

  const handleDeleteChangelog = async (changelogId) => {
    if (!confirm("Bu changelog'u silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await settings.deleteChangelog(changelogId);
      if (res?.success) {
        setChangelogOperationStatus({ type: "success", message: "Changelog başarıyla silindi!" });
      } else {
        setChangelogOperationStatus({ type: "error", message: res?.error || "Changelog silinemedi" });
      }
    } catch (err) {
      console.error("Changelog silme hatası (section):", err);
      setChangelogOperationStatus({ type: "error", message: "Changelog silinemedi" });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">📝 Changelog Yönetimi</h2>
        <Button size="sm" variant="secondary" onClick={() => setShowChangelogModal(true)} data-ers="settings.changelog.new-button">
          + Yeni Changelog
        </Button>
      </div>

      {changelogOperationStatus && changelogOperationStatus !== "loading" && (
        <div
          className={
            changelogOperationStatus?.type === "success"
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {changelogOperationStatus?.message}
        </div>
      )}

      {/* Changelog List */}
      {isLoadingChangelogs ? (
        <div className="text-slate-400">Changelog'lar yükleniyor...</div>
      ) : changelogs.length === 0 ? (
        <p className="text-slate-400">Henüz changelog bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {changelogs.map((changelog) => (
            <div key={changelog.id} className="bg-gray-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        changelog.type === "feature"
                          ? "bg-green-500/20 text-green-300"
                          : changelog.type === "bugfix"
                            ? "bg-red-500/20 text-red-300"
                            : changelog.type === "improvement"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {changelog.type === "feature"
                        ? "✨ Özellik"
                        : changelog.type === "bugfix"
                          ? "🐛 Hata Düzeltmesi"
                          : changelog.type === "improvement"
                            ? "⚡ İyileştirme"
                            : "📝 Diğer"}
                    </span>
                    <span className="text-sm text-slate-400">v{changelog.version}</span>
                    <span className="text-sm text-slate-400">
                      {new Date(changelog.releaseDate).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <h5 className="text-slate-100 font-medium mb-2">{changelog.title}</h5>
                  <p className="text-slate-300 whitespace-pre-line">{changelog.content}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary" onClick={() => handleEditChangelog(changelog)} data-ers={`settings.changelog.edit-button.${changelog.id}`}>
                    Düzenle
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteChangelog(changelog.id)} data-ers={`settings.changelog.delete-button.${changelog.id}`}>
                    Sil
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Changelog Modal */}
      {showChangelogModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-lg border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                {editingChangelog ? "Changelog Düzenle" : "Yeni Changelog"}
              </h3>
              <Button size="sm" variant="ghost" onClick={handleCloseChangelogModal} data-ers="settings.changelog.modal.close-button">✖</Button>
            </div>
            <div className="space-y-4">
              <InputField
                label="Başlık"
                value={newChangelog.title}
                onChange={(e) => setNewChangelog({ ...newChangelog, title: e.target.value })}
                placeholder="Changelog başlığı..."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tür</label>
                  <select
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                    value={newChangelog.type}
                    onChange={(e) => setNewChangelog({ ...newChangelog, type: e.target.value })}
                  >
                    <option value="feature">Özellik</option>
                    <option value="bugfix">Hata Düzeltmesi</option>
                    <option value="improvement">İyileştirme</option>
                    <option value="update">Diğer/Genel</option>
                  </select>
                </div>
                <InputField
                  label="Sürüm"
                  value={newChangelog.version}
                  onChange={(e) => setNewChangelog({ ...newChangelog, version: e.target.value })}
                  placeholder="Örn: 1.2.0"
                />
                <InputField
                  label="Yayın Tarihi"
                  value={newChangelog.releaseDate}
                  onChange={(e) => setNewChangelog({ ...newChangelog, releaseDate: e.target.value })}
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <InputField
                label="İçerik"
                value={newChangelog.content}
                onChange={(e) => setNewChangelog({ ...newChangelog, content: e.target.value })}
                placeholder="Changelog içeriği... Markdown yazabilirsiniz."
                multiline
                rows={6}
              />
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                variant="primary"
                onClick={handleSaveChangelog}
                disabled={changelogOperationStatus === "loading"}
                data-ers="settings.changelog.modal.save-button"
              >
                {changelogOperationStatus === "loading" ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button variant="secondary" onClick={handleCloseChangelogModal} data-ers="settings.changelog.modal.cancel-button">
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

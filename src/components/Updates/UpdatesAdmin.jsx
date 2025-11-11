import React, { useState, useEffect } from "react";
import { updatesApi } from "../../services/api";

const statuses = [
  { value: "planned", label: "Planlandı" },
  { value: "in_progress", label: "Devam Ediyor" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal Edildi" },
];

const types = [
  { value: "feature", label: "Özellik" },
  { value: "bugfix", label: "Hata Düzeltmesi" },
  { value: "improvement", label: "İyileştirme" },
  { value: "security", label: "Güvenlik" },
  { value: "performance", label: "Performans" },
];

const priorities = [
  { value: "low", label: "Düşük" },
  { value: "medium", label: "Orta" },
  { value: "high", label: "Yüksek" },
  { value: "critical", label: "Kritik" },
];

export default function UpdatesAdmin() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [expandedUpdate, setExpandedUpdate] = useState(null);
  const [showSubstepForm, setShowSubstepForm] = useState(false);
  const [editingSubstep, setEditingSubstep] = useState(null);
  const [selectedUpdateId, setSelectedUpdateId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for new/edit update
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "feature",
    status: "planned",
    priority: "medium",
    version: "",
    progress: 0,
    category: "",
  });

  const [substepFormData, setSubstepFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    progress: 0,
  });

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await updatesApi.getUpdates({ limit: 50 });
      if (response.success) {
        setUpdates(response.data);
      } else {
        setError("Güncellemeler yüklenemedi");
      }
    } catch (err) {
      console.error("Updates fetch error:", err);
      setError("Güncellemeler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpdate = async () => {
    try {
      setSaving(true);

      // Validation kontrolü
      if (!formData.title.trim()) {
        setError("Başlık alanı zorunludur");
        return;
      }

      if (!formData.description.trim()) {
        setError("Açıklama alanı zorunludur");
        return;
      }

      console.log("Creating update with data:", formData);
      const response = await updatesApi.createUpdate(formData);
      console.log("Create update response:", response);
      if (response.success) {
        await fetchUpdates();
        setShowCreateForm(false);
        resetForm();
      } else {
        setError("Güncelleme oluşturulamadı");
      }
    } catch (err) {
      console.error("Create update error:", err);
      setError("Güncelleme oluşturulurken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUpdate = async () => {
    try {
      setSaving(true);
      const response = await updatesApi.updateUpdate(
        editingUpdate.id,
        formData,
      );
      if (response.success) {
        await fetchUpdates();
        setEditingUpdate(null);
        resetForm();
      } else {
        setError("Güncelleme düzenlenemedi");
      }
    } catch (err) {
      console.error("Update update error:", err);
      setError("Güncelleme düzenlenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!confirm("Bu güncellemeyi silmek istediğinizden emin misiniz?")) return;

    try {
      setSaving(true);
      const response = await updatesApi.deleteUpdate(updateId);
      if (response.success) {
        await fetchUpdates();
      } else {
        setError("Güncelleme silinemedi");
      }
    } catch (err) {
      console.error("Delete update error:", err);
      setError("Güncelleme silinirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteUpdate = async (updateId) => {
    try {
      setSaving(true);
      const response = await updatesApi.completeUpdate(updateId, {
        releaseDate: new Date().toISOString(),
        notes: "Güncelleme tamamlandı",
      });
      if (response.success) {
        await fetchUpdates();
      } else {
        setError("Güncelleme tamamlanamadı");
      }
    } catch (err) {
      console.error("Complete update error:", err);
      setError("Güncelleme tamamlanırken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      version: "",
      description: "",
      type: "feature",
      status: "planned",
      priority: "medium",
      progress: 0,
      category: "",
    });
    setEditingUpdate(null);
    setShowForm(false);
    setShowCreateForm(false);
  };

  const resetSubstepForm = () => {
    setSubstepFormData({
      title: "",
      description: "",
      status: "pending",
      progress: 0,
    });
    setEditingSubstep(null);
    setShowSubstepForm(false);
    setSelectedUpdateId(null);
  };

  const startEdit = (update) => {
    setEditingUpdate(update);
    setFormData({
      title: update.title || "",
      description: update.description || "",
      type: update.type || "feature",
      status: update.status || "planned",
      priority: update.priority || "medium",
      version: update.version || "",
      progress: update.progress || 0,
      category: update.category || "",
    });
  };

  const cancelEdit = () => {
    resetForm();
    setShowCreateForm(false);
  };

  const handleCreateSubstep = async () => {
    if (!substepFormData.title.trim() || !selectedUpdateId) return;

    setSaving(true);
    try {
      const response = await updatesApi.createSubstep(
        selectedUpdateId,
        substepFormData,
      );
      if (response.success) {
        await fetchUpdates();
        resetSubstepForm();
      } else {
        setError(response.error || "Alt adım oluşturulurken hata oluştu");
      }
    } catch (error) {
      console.error("Error creating substep:", error);
      setError("Alt adım oluşturulurken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSubstep = async () => {
    if (!substepFormData.title.trim() || !editingSubstep || !selectedUpdateId)
      return;

    setSaving(true);
    try {
      const response = await updatesApi.updateSubstep(
        selectedUpdateId,
        editingSubstep.id,
        substepFormData,
      );
      if (response.success) {
        await fetchUpdates();
        resetSubstepForm();
      } else {
        setError(response.error || "Alt adım güncellenirken hata oluştu");
      }
    } catch (error) {
      console.error("Error updating substep:", error);
      setError("Alt adım güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubstep = async (substepId) => {
    if (!confirm("Bu alt adımı silmek istediğinizden emin misiniz?")) return;

    // Find the update that contains this substep
    const parentUpdate = updates.find(
      (update) =>
        update.substeps &&
        update.substeps.some((substep) => substep.id === substepId),
    );

    if (!parentUpdate) {
      setError("Alt adımın ait olduğu güncelleme bulunamadı");
      return;
    }

    setSaving(true);
    try {
      const response = await updatesApi.deleteSubstep(
        parentUpdate.id,
        substepId,
      );
      if (response.success) {
        await fetchUpdates();
      } else {
        setError(response.error || "Alt adım silinirken hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting substep:", error);
      setError("Alt adım silinirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const startSubstepEdit = (substep, updateId) => {
    setSubstepFormData({
      title: substep.title,
      description: substep.description || "",
      status: substep.status,
      progress: substep.progress || 0,
    });
    setEditingSubstep(substep);
    setSelectedUpdateId(updateId);
    setShowSubstepForm(true);
  };

  const startSubstepCreate = (updateId) => {
    resetSubstepForm();
    setSelectedUpdateId(updateId);
    setShowSubstepForm(true);
  };

  const toggleUpdateExpansion = (updateId) => {
    setExpandedUpdate(expandedUpdate === updateId ? null : updateId);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Güncellemeler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Güncel Geliştirmeler Yönetimi
          </h2>
          <p className="text-gray-400">
            Ana sayfada görünen güncellemeleri buradan yönetebilirsiniz.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          disabled={saving}
        >
          + Yeni Güncelleme
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-300 hover:text-red-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingUpdate) && (
        <div className="mb-6 p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingUpdate ? "Güncelleme Düzenle" : "Yeni Güncelleme Oluştur"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Başlık *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
                placeholder="Güncelleme başlığı"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Versiyon
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, version: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
                placeholder="v1.0.0"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Tür</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
              >
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Durum</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Öncelik
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priority: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                İlerleme (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    progress: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
                placeholder="Güncelleme kategorisi (opsiyonel)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
                rows={3}
                placeholder="Güncelleme açıklaması"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={editingUpdate ? handleUpdateUpdate : handleCreateUpdate}
              disabled={saving || !formData.title.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {saving
                ? "Kaydediliyor..."
                : editingUpdate
                  ? "Güncelle"
                  : "Oluştur"}
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Substep Create/Edit Form */}
      {showSubstepForm && (
        <div className="mb-6 p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingSubstep ? "Alt Adım Düzenle" : "Yeni Alt Adım Oluştur"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Başlık *
              </label>
              <input
                type="text"
                value={substepFormData.title}
                onChange={(e) =>
                  setSubstepFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
                placeholder="Alt adım başlığı"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Durum</label>
              <select
                value={substepFormData.status}
                onChange={(e) =>
                  setSubstepFormData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
              >
                <option value="pending">Bekliyor</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                İlerleme (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={substepFormData.progress}
                onChange={(e) =>
                  setSubstepFormData((prev) => ({
                    ...prev,
                    progress: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                value={substepFormData.description}
                onChange={(e) =>
                  setSubstepFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white"
                rows={3}
                placeholder="Alt adım açıklaması"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={
                editingSubstep ? handleUpdateSubstep : handleCreateSubstep
              }
              disabled={saving || !substepFormData.title.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {saving
                ? "Kaydediliyor..."
                : editingSubstep
                  ? "Güncelle"
                  : "Oluştur"}
            </button>
            <button
              onClick={resetSubstepForm}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Updates List */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Henüz güncelleme bulunmuyor. İlk güncellemeyi oluşturun!
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {update.title}
                    </h3>
                    {update.version && (
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                        v{update.version}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        update.status === "completed"
                          ? "bg-green-600 text-white"
                          : update.status === "in_progress"
                            ? "bg-blue-600 text-white"
                            : update.status === "planned"
                              ? "bg-yellow-600 text-black"
                              : "bg-red-600 text-white"
                      }`}
                    >
                      {statuses.find((s) => s.value === update.status)?.label ||
                        update.status}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        update.priority === "critical"
                          ? "bg-red-500 text-white"
                          : update.priority === "high"
                            ? "bg-orange-500 text-white"
                            : update.priority === "medium"
                              ? "bg-yellow-500 text-black"
                              : "bg-gray-500 text-white"
                      }`}
                    >
                      {priorities.find((p) => p.value === update.priority)
                        ?.label || update.priority}
                    </span>

                    {/* Substeps indicator - Always show */}
                    <button
                      onClick={() => toggleUpdateExpansion(update.id)}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-full transition-colors"
                    >
                      {update.substeps && update.substeps.length > 0
                        ? `${update.substeps.length} Alt Adım ${expandedUpdate === update.id ? "▼" : "▶"}`
                        : `Alt Adımlar ${expandedUpdate === update.id ? "▼" : "▶"}`}
                    </button>
                  </div>

                  {update.description && (
                    <p className="text-gray-300 text-sm mb-2">
                      {update.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>
                      Tür:{" "}
                      {types.find((t) => t.value === update.type)?.label ||
                        update.type}
                    </span>
                    {update.progress !== null && (
                      <span>İlerleme: %{update.progress}</span>
                    )}
                    {update.category && (
                      <span>Kategori: {update.category}</span>
                    )}
                    <span>
                      Oluşturuldu:{" "}
                      {new Date(update.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>

                  {update.progress !== null && update.progress > 0 && (
                    <div className="mt-3">
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-green-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, update.progress))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Substeps Section */}
                  {expandedUpdate === update.id && (
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-600/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white">
                          Alt Adımlar
                        </h4>
                        <button
                          onClick={() => startSubstepCreate(update.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                        >
                          + Alt Adım Ekle
                        </button>
                      </div>

                      {update.substeps && update.substeps.length > 0 ? (
                        <div className="space-y-2">
                          {update.substeps.map((substep) => (
                            <div
                              key={substep.id}
                              className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-600/20"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-white">
                                    {substep.title}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      substep.status === "completed"
                                        ? "bg-green-600 text-white"
                                        : substep.status === "in_progress"
                                          ? "bg-blue-600 text-white"
                                          : "bg-gray-600 text-white"
                                    }`}
                                  >
                                    {substep.status === "completed"
                                      ? "Tamamlandı"
                                      : substep.status === "in_progress"
                                        ? "Devam Ediyor"
                                        : "Bekliyor"}
                                  </span>
                                </div>
                                {substep.description && (
                                  <p className="text-xs text-gray-400">
                                    {substep.description}
                                  </p>
                                )}
                                {substep.progress > 0 && (
                                  <div className="mt-2">
                                    <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-1 bg-gradient-to-r from-blue-400 to-green-400"
                                        style={{
                                          width: `${Math.min(100, Math.max(0, substep.progress))}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1">
                                      %{substep.progress}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 ml-3">
                                <button
                                  onClick={() =>
                                    startSubstepEdit(substep, update.id)
                                  }
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                >
                                  Düzenle
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteSubstep(substep.id)
                                  }
                                  disabled={saving}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                >
                                  Sil
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          Henüz alt adım bulunmuyor.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {update.status !== "completed" && (
                    <button
                      onClick={() => handleCompleteUpdate(update.id)}
                      disabled={saving}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                    >
                      Tamamla
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(update)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteUpdate(update.id)}
                    disabled={saving}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

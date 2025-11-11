import { useState, useEffect } from "react";
import { useTutorialAdmin } from "../../hooks/useTutorial";
import TutorialEditModal from "./TutorialEditModal";
import TutorialImportModal from "./TutorialImportModal";
import Header from "../Header";
import SiteFooter from "../SiteFooter";

function TutorialAdmin({ embedded = false }) {
  const { isAdmin, listTutorials, deleteTutorial } = useTutorialAdmin();
  const [tutorials, setTutorials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTutorialId, setSelectedTutorialId] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadTutorials();
    }
  }, [isAdmin]);

  // Sayfa geri dönüşünde modalı otomatik aç (query veya localStorage ile)
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const shouldOpen = params.get("openEditModal") === "1";
      const stepIndexParam = params.get("stepIndex");
      const persisted = localStorage.getItem("junoro:tutorialSelection");
      if (shouldOpen || persisted) {
        setSelectedTutorialId(null); // oluşturma modunu aç
        setEditModalOpen(true);
        // URL’deki paramları temizlemek isterseniz (opsiyonel):
        // params.delete('openEditModal'); params.delete('stepIndex'); history.replaceState(null, '', window.location.pathname)
      }
    } catch (e) {
      // sessiz geç
    }
  }, [isAdmin]);

  const loadTutorials = async () => {
    try {
      setIsLoading(true);
      const tutorialList = await listTutorials();
      setTutorials(tutorialList);
    } catch (err) {
      setError("Tutorial listesi yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (tutorialId) => {
    setSelectedTutorialId(tutorialId);
    setEditModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedTutorialId(null);
    setEditModalOpen(true);
  };

  const handleOpenImport = () => {
    setImportModalOpen(true);
  };

  const handleDelete = async (tutorialId) => {
    if (window.confirm("Bu tutorial'ı silmek istediğinizden emin misiniz?")) {
      try {
        await deleteTutorial(tutorialId);
        await loadTutorials(); // Listeyi yenile
      } catch (err) {
        setError("Tutorial silinirken hata oluştu");
      }
    }
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedTutorialId(null);
    loadTutorials(); // Listeyi yenile
  };

  const handleImportClose = () => {
    setImportModalOpen(false);
  };

  const handleProceedToEdit = () => {
    // Import modalinden gelen draft, yeni modal açıldığında otomatik yüklenecek
    setSelectedTutorialId(null);
    setImportModalOpen(false);
    setEditModalOpen(true);
  };

  if (!isAdmin) {
    if (embedded) {
      return (
        <div className="bg-slate-800 rounded-lg p-8">
          <h2 className="text-xl font-bold text-white mb-2">Yetkisiz Erişim</h2>
          <p className="text-gray-300 mb-4">
            Bu bölüm için admin yetkisi gereklidir.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Geri Dön
          </button>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 rounded-lg p-8 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-white mb-4">
            Yetkisiz Erişim
          </h2>
          <p className="text-gray-300 mb-6">
            Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const content = (
    <div className="p-6 flex-1">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Tutorial Yönetimi
            </h1>
            <p className="text-gray-400">Uygulama tutorial'larını yönetin</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>+</span>
              Yeni Tutorial
            </button>
            <button
              id="tutorial-import-txt"
              data-registry="ADMIN.TUTORIALS.B.IMPORT_TXT"
              onClick={handleOpenImport}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 border border-slate-600"
              title=".txt dosyasından içe aktar"
            >
              <span>⬇️</span>
              İçe Aktar (.txt)
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-white text-lg">Yükleniyor...</div>
          </div>
        ) : (
          /* Tutorial List */
          <div className="grid gap-6">
            {tutorials.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  Henüz tutorial bulunmuyor
                </div>
                <button
                  onClick={handleCreate}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  İlk Tutorial'ı Oluştur
                </button>
              </div>
            ) : (
              tutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {tutorial.title}
                        </h3>
                        <span className="bg-slate-700 text-gray-300 px-2 py-1 rounded text-sm">
                          {tutorial.id}
                        </span>
                        <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-sm">
                          v{tutorial.version}
                        </span>
                      </div>

                      {tutorial.description && (
                        <p className="text-gray-400 mb-3">
                          {tutorial.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{tutorial.steps?.length || 0} adım</span>
                        <span>•</span>
                        <span>
                          Otomatik başlat:{" "}
                          {tutorial.settings?.autoStart ? "Evet" : "Hayır"}
                        </span>
                        <span>•</span>
                        <span>
                          Atlama:{" "}
                          {tutorial.settings?.allowSkip ? "İzinli" : "Yasak"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(tutorial.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(tutorial.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>

                  {/* Tutorial Steps Preview */}
                  {tutorial.steps && tutorial.steps.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        Adımlar:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {tutorial.steps.slice(0, 6).map((step, index) => (
                          <div
                            key={index}
                            className="bg-slate-700/50 rounded p-2 text-sm"
                          >
                            <div className="text-white font-medium truncate">
                              {index + 1}. {step.title || "Başlıksız"}
                            </div>
                            <div className="text-gray-400 text-xs truncate">
                              Target: {step.target || "Belirtilmemiş"}
                            </div>
                          </div>
                        ))}
                        {tutorial.steps.length > 6 && (
                          <div className="bg-slate-700/30 rounded p-2 text-sm text-gray-400 flex items-center justify-center">
                            +{tutorial.steps.length - 6} daha...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Edit Modal */}
        <TutorialEditModal
          isOpen={editModalOpen}
          onClose={handleModalClose}
          tutorialId={selectedTutorialId}
        />
        {/* Import Modal */}
        <TutorialImportModal
          isOpen={importModalOpen}
          onClose={handleImportClose}
          onProceedToEdit={handleProceedToEdit}
        />
      </div>
    </div>
  );

  if (embedded) {
    return <div className="bg-slate-900/40 rounded-xl">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      {content}
      <SiteFooter />
    </div>
  );
}

export default TutorialAdmin;

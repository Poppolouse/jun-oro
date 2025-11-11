import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import LiveClock from "../components/LiveClock";
import SiteFooter from "../components/SiteFooter";
import ElementSelector from "../components/Tutorial/ElementSelector";
import UpdatesCard from "../components/Updates/UpdatesCard";
import ChangelogSidebar from "../components/Changelog/ChangelogSidebar";
import { useTutorial, useTutorialAdmin } from "../hooks/useTutorial";

function HomePage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(0);

  // Tutorial hook'unu kullan
  useTutorial("home-page", { pageName: "home" });

  // Admin hook'unu kullan
  const { isAdmin } = useTutorialAdmin();

  // Saat güncelleme
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const applications = [
    {
      id: 1,
      name: "Arkade",
      icon: "🎮",
      status: "active",
      path: "/arkade/library",
      description: "Oyun kütüphanesi, ilerleme takibi ve istatistikler",
    },
    {
      id: 2,
      name: "Sinepedi",
      icon: "🎬",
      status: "coming_soon",
      path: "/sinepedi",
      description: "Film keşfi, değerlendirme ve izleme listesi",
    },
    {
      id: 3,
      name: "Zombososyal",
      icon: "🧟",
      status: "coming_soon",
      path: "/zombososyal",
      description: "Sosyal medya platformu ve topluluk ağı",
    },
    {
      id: 4,
      name: "Bölüm Bölüm",
      icon: "📺",
      status: "coming_soon",
      path: "/bolum-bolum",
      description: "Dizi takibi, bölüm ilerlemesi ve öneriler",
    },
    {
      id: 5,
      name: "Sayfa",
      icon: "📚",
      status: "coming_soon",
      path: "/sayfa",
      description: "Kitap okuma takibi, notlar ve alıntılar",
    },
    {
      id: 6,
      name: "Melodi",
      icon: "🎵",
      status: "coming_soon",
      path: "/melodi",
      description: "Müzik keşfi, playlist yönetimi ve istatistikler",
    },
    {
      id: 7,
      name: "Besinepedi",
      icon: "🍽️",
      status: "coming_soon",
      path: "/besinepedi",
      description: "Yemek tarifleri, beslenme takibi ve menü planlama",
    },
    {
      id: 8,
      name: "Kas Kurdu",
      icon: "🦆",
      status: "coming_soon",
      path: "/kas-kurdu",
      description: "Antrenman programları, ilerleme takibi ve hedefler",
    },
    {
      id: 9,
      name: "FinansLab",
      icon: "💰",
      status: "coming_soon",
      path: "/finans-lab",
      description: "Kişisel finans yönetimi ve bütçe planlama",
    },
    {
      id: 10,
      name: "Rutin",
      icon: "🌱",
      status: "coming_soon",
      path: "/rutin",
      description: "Alışkanlık oluşturma, takip ve motivasyon",
    },
    {
      id: 11,
      name: "Titan",
      icon: "🛡️",
      status: "coming_soon",
      path: "/titan",
      description: "Dosya yedekleme, senkronizasyon ve güvenlik",
    },
    {
      id: 12,
      name: "Yapyap",
      icon: "✅",
      status: "coming_soon",
      path: "/yapyap",
      description: "Görev yönetimi, proje takibi ve verimlilik",
    },
  ];

  const appsPerPage = 6; // 2 satır x 3 sütun
  const totalPages = Math.ceil(applications.length / appsPerPage);
  const currentApps = applications.slice(
    currentPage * appsPerPage,
    (currentPage + 1) * appsPerPage,
  );

  const formatTime = (date) => {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
      id="home-page"
      data-registry="1.0"
    >
      <Header />

      {/* Ana Layout - Changelog Sol, İçerik Orta */}
      <div className="flex" id="home-content" data-registry="1.0.B">
        {/* Changelog - Ekranın En Solunda Sabit */}
        <div className="w-80 min-h-screen p-6 bg-slate-900/50 border-r border-slate-700/50">
          <ChangelogSidebar />
        </div>

        {/* Ana İçerik - Geri Kalan Alan */}
        <div className="flex-1">
          <div className="max-w-6xl mx-auto px-8 py-12">
            {/* Büyük Saat */}
            <div
              className="text-center mb-8 main-clock"
              id="main-clock"
              data-registry="1.0.B2"
            >
              <div
                className="text-6xl md:text-8xl font-bold text-white mb-2 font-mono tracking-wider"
                id="clock-time"
                data-registry="1.0.B2.1"
              >
                {formatTime(currentTime)}
              </div>
              <div
                className="text-xl text-gray-400 capitalize"
                id="clock-date"
                data-registry="1.0.B2.2"
              >
                {formatDate(currentTime)}
              </div>
            </div>

            {/* Arama Çubuğu */}
            <div
              className="mb-12 search-bar"
              id="search-section"
              data-registry="1.0.B3"
            >
              <div className="relative max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Uygulamalarda ara..."
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-2xl px-6 py-4 text-white placeholder-gray-400 text-lg focus:outline-none focus:border-slate-500 transition-colors"
                    disabled
                    id="search-input"
                    data-registry="1.0.B3.1"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <span
                      className="text-xs px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/30"
                      data-registry="1.0.B3.2"
                    >
                      Çok Yakında
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Uygulamalar */}
            <div className="mb-8" id="apps-section" data-registry="1.0.B4">
              <h2
                className="text-2xl font-bold text-white mb-6 text-center"
                data-registry="1.0.B4.1"
              >
                🚀 Tüm Uygulamalar
              </h2>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 apps-grid"
                id="apps-grid"
                data-registry="1.0.B4.2"
              >
                {currentApps.map((app) => (
                  <div
                    key={app.id}
                    className={`relative rounded-2xl p-6 border transition-all duration-300 group ${
                      app.status === "active"
                        ? "bg-slate-800/50 border-slate-600/50 hover:border-slate-500 cursor-pointer hover:scale-105"
                        : "bg-slate-800/30 border-slate-700/30 opacity-75"
                    }`}
                    onClick={() =>
                      app.status === "active" && navigate(app.path)
                    }
                    data-app={app.name.toLowerCase().replace(/\s+/g, "-")}
                    data-registry={`1.0.B4.2.${app.id}`}
                  >
                    {app.status === "coming_soon" && (
                      <div className="absolute top-4 right-4 z-10">
                        <span
                          className="text-xs px-2 py-1 rounded-full bg-slate-700/80 text-slate-300 border border-slate-600/50"
                          data-registry={`1.0.B4.2.${app.id}.1`}
                        >
                          Çok Yakında
                        </span>
                      </div>
                    )}
                    <div className="text-center">
                      <div
                        className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-4 transition-transform ${
                          app.status === "active"
                            ? "bg-gradient-to-br from-slate-600 to-slate-700 group-hover:scale-110"
                            : "bg-slate-700/50"
                        }`}
                        data-registry={`1.0.B4.2.${app.id}.2`}
                      >
                        {app.icon}
                      </div>
                      <h3
                        className="text-lg font-bold text-white mb-2"
                        data-registry={`1.0.B4.2.${app.id}.3`}
                      >
                        {app.name}
                      </h3>
                      <p
                        className="text-gray-400 text-sm mb-4 leading-relaxed"
                        data-registry={`1.0.B4.2.${app.id}.4`}
                      >
                        {app.description}
                      </p>
                      <button
                        className={`w-full py-2 rounded-xl font-medium transition-all ${
                          app.status === "active"
                            ? "bg-slate-700/50 border border-slate-600/50 text-white hover:bg-slate-600/50"
                            : "bg-slate-800/50 border border-slate-700/30 text-slate-400 cursor-not-allowed"
                        }`}
                        disabled={app.status !== "active"}
                        data-registry={`1.0.B4.2.${app.id}.5`}
                      >
                        {app.status === "active"
                          ? "Uygulamayı Aç"
                          : "Çok Yakında"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div
                  className="flex justify-center items-center gap-4 pagination"
                  id="pagination"
                  data-registry="1.0.B4.3"
                >
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentPage === 0}
                    className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-600/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-colors"
                    data-registry="1.0.B4.3.1"
                  >
                    ← Önceki
                  </button>
                  <div className="flex gap-2" data-registry="1.0.B4.3.2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === i
                            ? "bg-slate-600 text-white border border-slate-500"
                            : "bg-slate-800/50 border border-slate-600/50 text-gray-400 hover:bg-slate-700/50"
                        }`}
                        data-page={i}
                        data-registry={`1.0.B4.3.2.${i + 1}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(totalPages - 1, prev + 1),
                      )
                    }
                    disabled={currentPage === totalPages - 1}
                    className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-600/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-colors"
                    data-registry="1.0.B4.3.3"
                  >
                    Sonraki →
                  </button>
                </div>
              )}
            </div>

            {/* Güncel Geliştirmeler Kartı */}
            <UpdatesCard showManage={isAdmin} />
          </div>
        </div>
      </div>
      <SiteFooter />
      <ElementSelector />
    </div>
  );
}

export default HomePage;

import { useState, useEffect } from "react";

// API Base URL configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ChangelogSidebar = () => {
  const [changelogs, setChangelogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLatestChangelogs();
  }, []);

  const fetchLatestChangelogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/changelog/latest?limit=10`);

      if (!response.ok) {
        throw new Error("Failed to fetch changelogs");
      }

      const data = await response.json();
      setChangelogs(data);
    } catch (err) {
      console.error("Error fetching changelogs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "feature":
        return "✨";
      case "bugfix":
        return "🐛";
      case "update":
        return "🔄";
      case "security":
        return "🔒";
      default:
        return "📝";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "feature":
        return "text-green-400";
      case "bugfix":
        return "text-red-400";
      case "update":
        return "text-blue-400";
      case "security":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="w-80 bg-slate-800/50 border border-slate-600/50 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📋</span>
          <h3 className="text-lg font-bold text-white">Changelog</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-700/50 rounded mb-2"></div>
              <div className="h-3 bg-slate-700/30 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-slate-800/50 border border-slate-600/50 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📋</span>
          <h3 className="text-lg font-bold text-white">Changelog</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-400 text-sm mb-2">Changelog yüklenemedi</p>
          <button
            onClick={fetchLatestChangelogs}
            className="text-xs px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white hover:bg-slate-600/50 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-slate-800/50 border border-slate-600/50 rounded-2xl p-4 backdrop-blur-md"
      id="changelog-sidebar"
      data-registry="1.0.B1"
    >
      <div className="flex items-center gap-2 mb-4" data-registry="1.0.B1.1">
        <span className="text-xl">📋</span>
        <h3 className="text-base font-bold text-white">Changelog</h3>
      </div>

      {changelogs.length === 0 ? (
        <div className="text-center py-6" data-registry="1.0.B1.2">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-gray-400 text-xs">Henüz changelog bulunmuyor</p>
        </div>
      ) : (
        <div
          className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
          data-registry="1.0.B1.3"
        >
          {changelogs.map((changelog, index) => (
            <div
              key={changelog.id}
              className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group"
              data-registry={`1.0.B1.3.${index + 1}`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className={`text-sm ${getTypeColor(changelog.type)}`}>
                  {getTypeIcon(changelog.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium truncate group-hover:text-blue-300 transition-colors">
                    {changelog.title}
                  </h4>
                  {changelog.version && (
                    <span className="text-xs px-2 py-0.5 bg-slate-600/50 text-slate-300 rounded-full">
                      v{changelog.version}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-400 text-xs leading-relaxed mb-2">
                {truncateContent(changelog.content.replace(/[#*`]/g, ""))}
              </p>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="capitalize">{changelog.type}</span>
                <span>{formatDate(changelog.publishedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className="mt-4 pt-4 border-t border-slate-600/30"
        data-registry="1.0.B1.4"
      >
        <button className="w-full text-xs text-gray-400 hover:text-white transition-colors py-2 hover:bg-slate-700/30 rounded-lg">
          Tüm Changelog'leri Gör →
        </button>
      </div>
    </div>
  );
};

export default ChangelogSidebar;

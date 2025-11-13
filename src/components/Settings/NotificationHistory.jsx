import React from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";

export default function NotificationHistory({ history = [] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="space-y-3">
      {history.map((n, i) => (
        <div key={i} className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-white font-medium">{n.title}</div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    n.type === "info"
                      ? "bg-blue-500/20 text-blue-400"
                      : n.type === "success"
                        ? "bg-green-500/20 text-green-400"
                        : n.type === "warning"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : n.type === "error"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-purple-500/20 text-purple-400"
                  }`}
                >
                  {n.type === "info"
                    ? "Bilgi"
                    : n.type === "success"
                      ? "Başarı"
                      : n.type === "warning"
                        ? "Uyarı"
                        : n.type === "error"
                          ? "Hata"
                          : "Duyuru"}
                </span>
              </div>

              <div className="text-gray-300 text-sm mb-2 prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{n.message}</ReactMarkdown>
              </div>

              <div className="text-xs text-gray-400 mt-1">
                {n.recipients} • {n.sentAt}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

NotificationHistory.propTypes = {
  history: PropTypes.array,
};

NotificationHistory.defaultProps = {
  history: [],
};

import React from "react";

export default function AdminSidebar({
  adminNavGroups = [],
  adminActiveTab,
  setAdminActiveTab = () => {},
  isAdminSidebarExpanded = true,
  toggleSidebar = () => {},
  expandedCategories = {},
  toggleCategory = () => {},
}) {
  return (
    <div
      className={`bg-gray-800/50 rounded-xl p-4 transition-all duration-300 ${isAdminSidebarExpanded ? "w-64" : "w-16"}`}
      id="settings-admin-nav"
      data-registry="2.0.L.ADMIN_NAV"
    >
      <div className="flex items-center justify-between mb-4">
        {isAdminSidebarExpanded && (
          <h3 className="text-white font-semibold text-sm">Admin Panel</h3>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-colors"
          title={
            isAdminSidebarExpanded ? "Sidebar'ı Daralt" : "Sidebar'ı Genişlet"
          }
        >
          {isAdminSidebarExpanded ? "◀" : "▶"}
        </button>
      </div>

      <nav className="space-y-4">
        {adminNavGroups.map((group) => (
          <div key={group.id} className="space-y-2">
            <button
              onClick={() => isAdminSidebarExpanded && toggleCategory(group.id)}
              className={`w-full text-gray-300 text-sm font-semibold flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-700/30 transition-colors ${!isAdminSidebarExpanded ? "justify-center" : "justify-between"}`}
              id={`settings-admin-group-${group.id}`}
              data-registry={`2.0.L.ADMIN_NAV.${group.id}`}
              title={!isAdminSidebarExpanded ? group.name : ""}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{group.icon}</span>
                {isAdminSidebarExpanded && <span>{group.name}</span>}
              </div>
              {isAdminSidebarExpanded && (
                <span className="text-xs text-gray-400">
                  {expandedCategories[group.id] ? "▼" : "▶"}
                </span>
              )}
            </button>

            {expandedCategories[group.id] && (
              <div className="space-y-1 ml-2">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAdminActiveTab(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${adminActiveTab === item.id ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700/50"} ${!isAdminSidebarExpanded ? "justify-center" : ""}`}
                    id={`settings-admin-item-${item.id}`}
                    data-registry={`2.0.L.ADMIN_NAV.${group.id}.${item.id}`}
                    title={!isAdminSidebarExpanded ? item.name : ""}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {isAdminSidebarExpanded && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

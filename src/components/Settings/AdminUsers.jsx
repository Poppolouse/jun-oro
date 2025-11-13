import React from "react";
import PropTypes from "prop-types";

export default function AdminUsers({
  users = [],
  pendingUsers = [],
  onApproveUser = () => {},
  onRejectUser = () => {},
  onEditUser = () => {},
  onAddNewUser = () => {},
  onDeleteUser = () => {},
  loadUserSecurity = () => {},
  expandedUserDetails = {},
  toggleDetail = () => {},
  showPasswords = {},
  togglePasswordVisibility = () => {},
}) {
  return (
    <div className="space-y-6">
      {pendingUsers.length > 0 && (
        <div className="mb-4 bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4">
          <h5 className="text-lg font-semibold text-yellow-400 mb-3">
            ⏳ Onay Bekleyen Kullanıcılar ({pendingUsers.length})
          </h5>
          <div className="space-y-2">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {u.profileImage ? (
                    <img
                      src={u.profileImage}
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                      {u.username?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-white font-medium">{u.username}</div>
                    <div className="text-gray-400 text-sm">{u.email}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onApproveUser(u.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    ✓ Onayla
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectUser(u.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    ✗ Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-white">Kullanıcı Yönetimi</h4>
        <button
          type="button"
          onClick={onAddNewUser}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          + Yeni Kullanıcı
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-800/50 rounded-xl p-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-300 py-2 px-3">Kullanıcı</th>
              <th className="text-left text-gray-300 py-2 px-3">Email</th>
              <th className="text-left text-gray-300 py-2 px-3">Rol</th>
              <th className="text-left text-gray-300 py-2 px-3">Durum</th>
              <th className="text-left text-gray-300 py-2 px-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <React.Fragment key={u.id}>
                <tr className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {u.profileImage ? (
                        <img
                          src={u.profileImage}
                          alt={u.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {u.username?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">
                          {u.username}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {u.name ||
                            `${u.profile?.firstName || ""} ${u.profile?.lastName || ""}`.trim()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-300">{u.email}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${u.role === "admin" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}
                    >
                      {u.role === "admin" ? "Admin" : "Kullanıcı"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-300">
                    {u.status === "active"
                      ? "Aktif"
                      : u.status === "pending"
                        ? "Beklemede"
                        : "Pasif"}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEditUser(u)}
                        className="text-blue-400 text-sm"
                      >
                        Düzenle
                      </button>
                      {u.id !== 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u.id)}
                          className="text-red-400 text-sm"
                        >
                          Sil
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Security details"
                        onClick={() => toggleDetail(u.id, "security")}
                        className="text-sm text-gray-400"
                      >
                        🔒
                      </button>
                      <button
                        type="button"
                        aria-label="Usage details"
                        onClick={() => toggleDetail(u.id, "data")}
                        className="text-sm text-gray-400"
                      >
                        📊
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedUserDetails[`${u.id}_security`] && (
                  <tr className="bg-red-500/5 border-b border-gray-700/50">
                    <td colSpan="5" className="py-3 px-3">
                      <div className="p-3 bg-gray-700/30 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-gray-400 text-xs">
                              Kullanıcı Şifresi
                            </div>
                            <div className="text-white font-mono text-sm">
                              {showPasswords[u.id] ? u.password : "••••••••"}
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label="Toggle password visibility"
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded"
                          >
                            👁️
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {expandedUserDetails[`${u.id}_data`] && (
                  <tr className="bg-blue-500/5 border-b border-gray-700/50">
                    <td colSpan="5" className="py-3 px-3">
                      <div className="p-3 bg-gray-700/30 rounded">
                        <div className="text-gray-300 text-sm">
                          Veri kullanım detayları burada gösterilecek.
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * AdminUsers component prop types
 */
AdminUsers.propTypes = {
  users: PropTypes.array,
  pendingUsers: PropTypes.array,
  onApproveUser: PropTypes.func,
  onRejectUser: PropTypes.func,
  onEditUser: PropTypes.func,
  onAddNewUser: PropTypes.func,
  onDeleteUser: PropTypes.func,
  loadUserSecurity: PropTypes.func,
  expandedUserDetails: PropTypes.object,
  toggleDetail: PropTypes.func,
  showPasswords: PropTypes.object,
  togglePasswordVisibility: PropTypes.func,
};

import React from "react";
import PropTypes from "prop-types";

export default function UserModal({ user, onChange, onSave, onCancel }) {
  if (!user) return null;

  const update = (patch) => {
    onChange({ ...user, ...patch });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {user.id === null ? "Yeni Kullanıcı Ekle" : "Kullanıcı Düzenle"}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={user.username || ""}
              onChange={(e) => update({ username: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={user.email || ""}
              onChange={(e) => update({ email: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Şifre{" "}
              {user.id === null && <span className="text-red-400">*</span>}
            </label>
            <input
              type="password"
              value={user.password || ""}
              onChange={(e) => update({ password: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder={
                user.id === null
                  ? "Kullanıcı şifresi (zorunlu)"
                  : "Yeni şifre (boş bırakılırsa değişmez)"
              }
            />
            {user.id !== null && (
              <p className="text-xs text-gray-400 mt-1">
                Şifreyi değiştirmek istemiyorsanız boş bırakın
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Ad
              </label>
              <input
                type="text"
                value={user.profile?.firstName || ""}
                onChange={(e) =>
                  update({
                    profile: { ...user.profile, firstName: e.target.value },
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Soyad
              </label>
              <input
                type="text"
                value={user.profile?.lastName || ""}
                onChange={(e) =>
                  update({
                    profile: { ...user.profile, lastName: e.target.value },
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Rol
              </label>
              <select
                value={user.role || "user"}
                onChange={(e) => update({ role: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Durum
              </label>
              <select
                value={user.status || "offline"}
                onChange={(e) => update({ status: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="active">Aktif</option>
                <option value="pending">Beklemede</option>
                <option value="inactive">Pasif</option>
                <option value="banned">Yasaklı</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave()}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            {user.id === null ? "Kullanıcı Ekle" : "Güncelle"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}

UserModal.propTypes = {
  user: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

UserModal.defaultProps = {
  user: null,
};

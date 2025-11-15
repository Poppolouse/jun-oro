import React from "react";
import PropTypes from "prop-types";
import { Button, InputField } from "../ui";

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
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
          >
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <InputField
            label="Kullanıcı Adı"
            type="text"
            value={user.username || ""}
            onChange={(e) => update({ username: e.target.value })}
          />

          <InputField
            label="Email"
            type="email"
            value={user.email || ""}
            onChange={(e) => update({ email: e.target.value })}
          />

          <InputField
            label={
              <>
                Şifre{" "}
                {user.id === null && <span className="text-red-400">*</span>}
              </>
            }
            type="password"
            value={user.password || ""}
            onChange={(e) => update({ password: e.target.value })}
            placeholder={
              user.id === null
                ? "Kullanıcı şifresi (zorunlu)"
                : "Yeni şifre (boş bırakılırsa değişmez)"
            }
            hint={user.id !== null ? "Şifreyi değiştirmek istemiyorsanız boş bırakın" : undefined}
          />

          <div className="grid grid-cols-1 gap-4">
            <InputField
              label="Ad"
              type="text"
              value={user.profile?.firstName || ""}
              onChange={(e) =>
                update({
                  profile: { ...user.profile, firstName: e.target.value },
                })
              }
            />

            <InputField
              label="Soyad"
              type="text"
              value={user.profile?.lastName || ""}
              onChange={(e) =>
                update({
                  profile: { ...user.profile, lastName: e.target.value },
                })
              }
            />

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Rol
              </label>
              <select
                value={user.role || "user"}
                onChange={(e) => update({ role: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
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
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
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
          <Button
            onClick={() => onSave()}
            variant="primary"
            className="flex-1"
          >
            {user.id === null ? "Kullanıcı Ekle" : "Güncelle"}
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            İptal
          </Button>
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

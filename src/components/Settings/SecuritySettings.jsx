import React from "react";
import PropTypes from "prop-types";
import { InputField, Button } from "../ui";
import useUpdatePassword from "../../hooks/useUpdatePassword";

function SecuritySettings({ userId, onUpdatePassword }) {
  const pw = useUpdatePassword({ onUpdate: onUpdatePassword, userId });

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">🔒 Güvenlik</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Mevcut Şifre"
          type="password"
          placeholder="Mevcut şifreniz"
          value={pw.fields.currentPassword}
          onChange={(e) => pw.setCurrentPassword(e.target.value)}
        />
        <InputField
          label="Yeni Şifre"
          type="password"
          placeholder="Yeni şifre"
          value={pw.fields.newPassword}
          onChange={(e) => pw.setNewPassword(e.target.value)}
          error={pw.errors.newPassword}
        />
        <InputField
          label="Yeni Şifre (Tekrar)"
          type="password"
          placeholder="Yeni şifreyi tekrar girin"
          value={pw.fields.confirmPassword}
          onChange={(e) => pw.setConfirmPassword(e.target.value)}
          error={pw.errors.confirmPassword}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" onClick={pw.submit} loading={pw.isSubmitting}>
          Şifreyi Güncelle
        </Button>
        {pw.result?.type === "success" && (
          <span className="text-green-400 text-sm">Güncellendi</span>
        )}
        {pw.result?.type === "error" && (
          <span className="text-red-400 text-sm">{pw.result.message || "Hata"}</span>
        )}
      </div>
    </div>
  );
}

SecuritySettings.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onUpdatePassword: PropTypes.func.isRequired,
};

export default SecuritySettings;


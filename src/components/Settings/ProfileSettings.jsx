import React from "react";
import PropTypes from "prop-types";
import ImageUpload from "../FileUpload/ImageUpload";
import { InputField, Button } from "../ui";
import useProfileSettingsForm from "../../hooks/useProfileSettingsForm";

function ProfileSettings({
  profileImage = null,
  isUploading = false,
  onUpload,
  onDeleteAvatar,
  initialUser,
  onSaveProfile,
}) {
  const form = useProfileSettingsForm({ initialUser, onSave: onSaveProfile });

  return (
    <div className="space-y-6">
      {/* Profil Resmi Yükleme */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Profil Resmi</h3>
        </div>
        <div className="flex items-center gap-6">
          <ImageUpload
            onUpload={onUpload}
            currentImage={profileImage}
            uploadType="avatar"
            maxSize={5}
            disabled={isUploading}
            label={isUploading ? "Yükleniyor..." : "Avatar Yükle"}
            className="flex-shrink-0"
          />
          <div>
            <h4 className="text-white font-medium mb-2">Profil Resmi Yükle</h4>
            <p className="text-gray-400 text-sm mb-3">
              JPG, PNG, GIF veya WebP formatında resim yükleyebilirsiniz.
              Maksimum dosya boyutu 5MB'dır.
            </p>
            {profileImage && (
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onDeleteAvatar}
                  disabled={isUploading}
                  data-ers="settings.profile.avatar.delete-button"
                >
                  Sil
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profil Bilgileri Formu */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">👤 Profil Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="İsim"
            placeholder="İsminizi girin"
            value={form.values.name}
            onChange={form.handleChange("name")}
            error={form.errors.name}
          />
          <InputField
            label="Kullanıcı Adı"
            placeholder="Kullanıcı adınızı girin"
            value={form.values.username}
            onChange={form.handleChange("username")}
            error={form.errors.username}
          />
          <InputField
            label="Email"
            placeholder="Email adresiniz"
            type="email"
            value={form.values.email}
            onChange={form.handleChange("email")}
            error={form.errors.email}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button variant="primary" onClick={form.submit} loading={form.isSubmitting}>
            Kaydet
          </Button>
          <Button variant="secondary" onClick={form.reset} disabled={form.isSubmitting}>
            Sıfırla
          </Button>
          {form.submitResult?.type === "success" && (
            <span className="text-green-400 text-sm">Kaydedildi</span>
          )}
          {form.submitResult?.type === "error" && (
            <span className="text-red-400 text-sm">{form.submitResult.message || "Hata"}</span>
          )}
        </div>
      </div>

      {/* İstatistikler - Çok Yakında */}
      <div className="bg-gray-800/50 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            📊 İstatistikler
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              Çok Yakında
            </span>
          </h3>
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">📈</div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Detaylı Oyun İstatistikleri
            </h4>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Yakında oyun performansınız, ilerleme grafikleri, karşılaştırmalı
              analizler ve daha fazlası!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">???</div>
                <div className="text-gray-400 text-sm">Toplam Oyun</div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">???</div>
                <div className="text-gray-400 text-sm">Saat Oynandı</div>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">???</div>
                <div className="text-gray-400 text-sm">Başarım</div>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">???</div>
                <div className="text-gray-400 text-sm">Seviye</div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                📊 Grafikler
              </span>
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                🏆 Liderlik Tablosu
              </span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                📈 İlerleme
              </span>
              <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
                🎯 Hedefler
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ProfileSettings.propTypes = {
  profileImage: PropTypes.string,
  isUploading: PropTypes.bool,
  onUpload: PropTypes.func.isRequired,
  onDeleteAvatar: PropTypes.func.isRequired,
  initialUser: PropTypes.object,
  onSaveProfile: PropTypes.func,
};

// defaultProps kaldırıldı; fonksiyon parametrelerinde varsayılanlar kullanılıyor

export default ProfileSettings;

# Settings Sayfası - Kurtarma ve Tamamlama Planı (Nihai Versiyon)

**Ana Hedef:** `src/pages/SettingsPage.jsx` dosyasının boyutunu, içindeki bölümleri ayrı bileşenlere taşıyarak 500 satırın altına düşürmek.

**Talimatlar:** Aşağıdaki fazları sırayla ve tam olarak belirtildiği gibi uygula. Her faz, tek ve net bir göreve odaklanmıştır.

---

### **BÖLÜM 1: BÖLÜMLERİ AYIRMA (EXTRACTION)**

#### Faz A: Audit Logs Bölümünü Taşı
1.  **Analiz Et:** `SettingsPage.jsx` dosyasında "Denetim Günlükleri" (Audit Logs) ile ilgili tüm JSX kod bloğunu ve bu bloğun kullandığı state/fonksiyonları tespit et.
2.  **Taşı:** Bu JSX kodunu ve ilgili tüm mantığı `src/components/Settings/AuditLogsSection.jsx` dosyasına taşı.
3.  **Bağımsızlaştır:** `AuditLogsSection.jsx` bileşeninin, ihtiyaç duyduğu verileri ve fonksiyonları doğrudan `useSettingsData` hook'undan veya prop'lar aracılığıyla almasını sağla.
4.  **Temizle:** `SettingsPage.jsx` dosyasından, taşıdığın JSX kodunu ve artık sadece `AuditLogsSection` tarafından kullanılan state ve fonksiyonları sil.
5.  **Değiştir:** `SettingsPage.jsx` içinde, sildiğin kodun yerine sadece `<AuditLogsSection />` bileşenini yerleştir.

#### Faz B: API Keys Bölümünü Taşı
1.  **Analiz Et:** `SettingsPage.jsx` dosyasında "API Anahtarları" (API Keys) ile ilgili tüm JSX kodunu (modal dahil) ve mantığını tespit et.
2.  **Taşı:** Bu JSX'i ve mantığı `src/components/Settings/ApiKeysSection.jsx` dosyasına taşı.
3.  **Bağımsızlaştır:** `ApiKeysSection.jsx` bileşenini kendi kendine yetecek hale getir.
4.  **Temizle:** `SettingsPage.jsx` dosyasından ilgili kodları sil.
5.  **Değiştir:** `SettingsPage.jsx` içinde, sildiğin kodun yerine `<ApiKeysSection />` bileşenini yerleştir.

#### Faz C: Changelog Bölümünü Taşı
1.  **Analiz Et:** `SettingsPage.jsx` dosyasında "Changelog" ile ilgili tüm JSX kodunu ve mantığını tespit et.
2.  **Taşı:** Bu JSX'i ve mantığı `src/components/Settings/ChangelogSection.jsx` dosyasına taşı.
3.  **Bağımsızlaştır:** `ChangelogSection.jsx` bileşenini kendi kendine yetecek hale getir.
4.  **Temizle:** `SettingsPage.jsx` dosyasından ilgili kodları sil.
5.  **Değiştir:** `SettingsPage.jsx` içinde, sildiğin kodun yerine `<ChangelogSection />` bileşenini yerleştir.

#### Faz D: Traffic Logs Bölümünü Taşı
1.  **Analiz Et:** `SettingsPage.jsx` dosyasında "Trafik Günlükleri" (Traffic Logs) ile ilgili tüm JSX kodunu ve mantığını tespit et.
2.  **Taşı:** Bu JSX'i ve mantığı `src/components/Settings/TrafficLogsSection.jsx` dosyasına taşı.
3.  **Bağımsızlaştır:** `TrafficLogsSection.jsx` bileşenini kendi kendine yetecek hale getir.
4.  **Temizle:** `SettingsPage.jsx` dosyasından ilgili kodları sil.
5.  **Değiştir:** `SettingsPage.jsx` içinde, sildiğin kodun yerine `<TrafficLogsSection />` bileşenini yerleştir.

#### Faz E: Notification Tracking Bölümünü Taşı
1.  **Analiz Et:** `SettingsPage.jsx` dosyasında "Bildirim İstatistikleri" (Notification Tracking) ile ilgili tüm JSX kodunu ve mantığını tespit et.
2.  **Taşı:** Bu JSX'i ve mantığı `src/components/Settings/NotificationTrackingSection.jsx` dosyasına taşı.
3.  **Bağımsızlaştır:** `NotificationTrackingSection.jsx` bileşenini kendi kendine yetecek hale getir.
4.  **Temizle:** `SettingsPage.jsx` dosyasından ilgili kodları sil.
5.  **Değiştir:** `SettingsPage.jsx` içinde, sildiğin kodun yerine `<NotificationTrackingSection />` bileşenini yerleştir.

#### Faz F: R2 Storage Bölümünü Taşı
1.  **Analiz Et:** `SettingsPage.jsx` dosyasında "R2 Storage" ile ilgili tüm JSX kodunu ve mantığını tespit et.
2.  **Taşı:** Bu JSX'i ve mantığı `src/components/Settings/R2StorageSection.jsx` dosyasına taşı.
3.  **Bağımsızlaştır:** `R2StorageSection.jsx` bileşenini kendi kendine yetecek hale getir.
4.  **Temizle:** `SettingsPage.jsx` dosyasından ilgili kodları sil.
5.  **Değiştir:** `SettingsPage.jsx` içinde, sildiğin kodun yerine `<R2StorageSection />` bileşenini yerleştir.

---

### **BÖLÜM 2: STANDARTLARA UYUM**

#### Faz G: Stil ve Tasarım Sistemi Düzeltmeleri
1.  **Görev:** `ProfileSettings.jsx`, `SecuritySettings.jsx` ve Faz A'dan F'ye kadar oluşturulan tüm `...Section.jsx` bileşenlerini aç.
2.  **Uygula:** Bu dosyalardaki tüm renk kullanımlarını (`bg-gray-800`, `text-white` vb.) `GEMINI.md` içinde güncellenen **Dark Theme** paletindeki standartlarla değiştir.
3.  **Butonları Düzelt:** Standart olmayan buton kullanımlarını (`<button className="...">`) standart `<Button variant="...">` bileşeniyle değiştir.

#### Faz H: ERS Kodlarını Ekleme
1.  **Görev:** Faz G'de listelenen tüm bileşen dosyalarını tekrar aç.
2.  **Uygula:** İçlerindeki tüm interaktif elementlere (`button`, `input`, `a`, `div[onClick]` vb.) `data-ers` attribute'u ekle. ERS kod hiyerarşisi `docs/ERS-REGISTRY.md`'deki mantığa uygun olmalıdır.

---

### **BÖLÜM 3: SONUÇLANDIRMA**

#### Faz I: Son Temizlik ve Doğrulama
1.  **Görev:** `SettingsPage.jsx` dosyasına geri dön.
2.  **Temizle:** Artık hiçbir alt bileşen tarafından kullanılmayan tüm `useState`, `useEffect`, `useCallback` ve yardımcı fonksiyonları dosyadan tamamen sil.
3.  **Doğrula:** `SettingsPage.jsx` dosyasının satır sayısının 500'ün altına indiğini kontrol et.
4.  **Kontrol Et:** Projenin `npm run lint` ve `npm run build` komutlarının hatasız çalıştığından emin ol.

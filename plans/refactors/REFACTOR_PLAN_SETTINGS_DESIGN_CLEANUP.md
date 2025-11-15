# Refactor Planı: Ayarlar Sayfası Tasarım Standardizasyonu

**Ana Hedef:** `SettingsPage` ve ona bağlı tüm alt bileşenlerdeki tasarımsal tutarsızlıkları gidermek. Tüm bileşenleri, projenin standart Koyu Teması'na ve atomik UI bileşenlerine (`Button`, `InputField`, `Card` vb.) tam uyumlu hale getirmek.

---

### **BÖLÜM 1: En Sorunlu Bileşenler (Acil Düzeltme)**

#### 1.1. `TrafficLogsSection.jsx` - Komple Tema Değişikliği

*   **Sorun:** Bu bileşen tamamen eski, açık tema renklerini kullanıyor.
*   **Eylem Planı:**
    1.  Filtreler bölümündeki ana `div`'in `bg-[#EEEAE4] border-[#DDD6CF]` sınıflarını `bg-slate-800/50 border-slate-700/50` ile değiştir.
    2.  Tüm metin renklerini (`text-[#2D2A26]`, `text-[#6B6661]`) standart koyu tema renkleriyle (`text-white`, `text-slate-300`, `text-slate-400`) değiştir.
    3.  İstatistik kartlarındaki `bg-[#EEEAE4]` sınıfını `bg-slate-700/50` ile değiştir.
    4.  Standart olmayan `select` elementlerini, `ChangelogSection.jsx` dosyasında olduğu gibi standart Tailwind sınıfları (`bg-slate-700 border-slate-600 text-white`) kullanarak güncelle.
    5.  Tablodaki (`<table>`) tüm açık tema renklerini (`border-[#DDD6CF]`, `hover:bg-[#EEEAE4]`) koyu tema alternatifleriyle (`border-slate-700`, `hover:bg-slate-700/50`) değiştir.

#### 1.2. `AdminUsers.jsx` - Buton ve Renk Standardizasyonu

*   **Sorun:** Onay ve aksiyon butonları standart değil ve renkleri uyumsuz.
*   **Eylem Planı:**
    1.  "Onay Bekleyen Kullanıcılar" bölümündeki `bg-yellow-900/20` ve `text-yellow-400` gibi sınıfları koru, çünkü bunlar durumu belirten (warning) renkler ve tutarlı. Ancak butonları değiştir:
        *   `"✓ Onayla"` butonunu `<Button size="sm" variant="success">Onayla</Button>` ile değiştir.
        *   `"✗ Reddet"` butonunu `<Button size="sm" variant="danger">Reddet</Button>` ile değiştir.
    2.  `"+ Yeni Kullanıcı"` butonunu `<Button variant="success">+ Yeni Kullanıcı</Button>` ile değiştir.
    3.  Tablo içindeki "Düzenle" ve "Sil" butonlarını sırasıyla `<Button size="sm" variant="ghost">Düzenle</Button>` ve `<Button size="sm" variant="danger_ghost">Sil</Button>` ile değiştir.

#### 1.3. `AdminNotifications.jsx` - Form Elemanlarını Standardize Etme

*   **Sorun:** Form elemanları ve butonlar standart UI bileşenlerini kullanmıyor.
*   **Eylem Planı:**
    1.  `Başlık` için kullanılan `input` elementini `<InputField label="Başlık" ... />` ile değiştir.
    2.  `Mesaj` için kullanılan `textarea` elementini `<InputField multiline label="Mesaj" ... />` ile değiştir.
    3.  `Bildirim Tipi` için kullanılan `select` elementini, standartlaştırılmış `select` stiliyle (bkz: `TrafficLogsSection.jsx` planı) güncelle.
    4.  `"📤 Bildirim Gönder"` butonunu `<Button variant="primary">Bildirim Gönder</Button>` ile değiştir.
    5.  Sayfalama (`Önceki`/`Sonraki`) butonlarını `<Button variant="secondary">...</Button>` ile değiştir.

#### 1.4. `UserModal.jsx` - Modal İçi Form Standardizasyonu

*   **Sorun:** Modal içindeki tüm form elemanları ve butonlar standart dışı.
*   **Eylem Planı:**
    1.  Tüm `input` elementlerini `<InputField ... />` bileşeniyle değiştir.
    2.  Tüm `select` elementlerini standartlaştırılmış `select` stiliyle güncelle.
    3.  `"Kullanıcı Ekle"`/`"Güncelle"` butonunu `<Button variant="primary">...</Button>` ile değiştir.
    4.  `"İptal"` butonunu `<Button variant="secondary">İptal</Button>` ile değiştir.

---

### **BÖLÜM 2: Kısmi Düzeltmeler**

#### 2.1. `AdminSidebar.jsx`

*   **Sorun:** Aktif sekme rengi hard-coded `bg-blue-500`.
*   **Eylem Planı:**
    1.  `bg-blue-500` sınıfını, projenin birincil rengini temsil eden bir Tailwind rengiyle (örn: `bg-primary-600` veya mevcut sistemdeki gibi `bg-blue-600`) değiştirerek tutarlılığı artır. Bu, gelecekteki tema değişikliklerini kolaylaştırır.

#### 2.2. `AuditLogsSection.jsx`

*   **Sorun:** Filtreleme `select` elementi standart değil.
*   **Eylem Planı:**
    1.  `select` elementini, standartlaştırılmış `select` stiliyle (`bg-slate-700 border-slate-600 text-white` vb.) güncelle.

#### 2.3. `R2StorageSection.jsx`

*   **Sorun:** Butonların iç yapısı standart dışı ve eski tema rengi kullanılıyor.
*   **Eylem Planı:**
    1.  Butonların içindeki `<div>` yapısını kaldır. Buton metnini ve ikonunu doğrudan `<Button>` bileşeninin `children`'ı olarak veya `icon` prop'u (varsa) ile ver.
    2.  `text-[#6B6661]` sınıfını `text-slate-400` ile değiştir.

---

### **BÖLÜM 3: Doğrulama**

1.  **Görev:** Yukarıdaki tüm değişiklikler yapıldıktan sonra, `SettingsPage`'i aç ve tüm sekmeler arasında gezinerek (hem normal kullanıcı hem de admin olarak) herhangi bir tasarım tutarsızlığı kalmadığından emin ol.
2.  **Kontrol:** `npm run lint` ve `npm run build` komutlarını çalıştırarak projenin hatasız bir şekilde derlendiğini doğrula.

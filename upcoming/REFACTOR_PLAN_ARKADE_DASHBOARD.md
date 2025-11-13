# Refactor Planı: ArkadeDashboard.jsx

**Ana Hedef:** `src/pages/ArkadeDashboard.jsx` sayfasını, gelecekteki işlevselliği kolayca eklenebilecek şekilde modüler, standartlara uygun ve atomik bileşen yapısına sahip bir hale getirmek.

---

### **BÖLÜM 1: BİLEŞEN YAPISINI OLUŞTURMA**

#### Faz A: Bileşen Dosyalarını Oluşturma (Stubbing)

1.  **Görev:** Aşağıdaki boş bileşen dosyalarını oluştur. Bu dosyalar, Faz B ve C'de doldurulacaktır.
    *   `src/components/Dashboard/DashboardHeader.jsx`
    *   `src/components/Dashboard/FeatureCard.jsx`
    *   `src/components/Dashboard/ComingSoonFooter.jsx`
    *   `src/components/Dashboard/RightSidebar.jsx`

---

### **BÖLÜM 2: JSX ve STİL MİGRASYONU**

#### Faz B: Statik JSX Kodunu Bileşenlere Taşıma

1.  **`DashboardHeader.jsx`:**
    *   **Taşı:** `ArkadeDashboard.jsx` içindeki ana başlık (`h1`), "Çok Yakında" rozeti ve ana açıklamayı (`p`) içeren JSX kodunu `DashboardHeader.jsx` içine taşı.
2.  **`FeatureCard.jsx`:**
    *   **Taşı:** "Özellikler Grid" bölümündeki 6 karttan birinin JSX yapısını `FeatureCard.jsx` içine taşı.
    *   **Props Oluştur:** Bileşenin `icon`, `title` ve `description` gibi `props` almasını sağla.
3.  **`ComingSoonFooter.jsx`:**
    *   **Taşı:** Sayfanın en altındaki bilgilendirme kutusunun JSX kodunu `ComingSoonFooter.jsx` içine taşı.
4.  **`RightSidebar.jsx`:**
    *   **Taşı:** Sayfanın sağındaki dikey "sidebar" bölümünün tüm JSX kodunu `RightSidebar.jsx` içine taşı.

#### Faz C: Ana Sayfayı Yeni Bileşenlerle Güncelleme

1.  **Görev:** `ArkadeDashboard.jsx` dosyasını aç.
2.  **Değiştir:** Faz B'de taşıdığın tüm JSX bloklarını, oluşturduğun yeni bileşenlerle değiştir.
    *   Örnek: `<DashboardHeader />`
    *   Özellikler grid'i için, `FeatureCard` bileşenini 6 farklı `prop` ile 6 kez çağır.
    *   Örnek: `<FeatureCard icon="📊" title="Detaylı İstatistikler" ... />`
    *   `<ComingSoonFooter />`
    *   `<RightSidebar />`

---

### **BÖLÜM 3: STANDARTLARA UYUM**

#### Faz D: Tasarım Sistemi ve Atomik Bileşen Entegrasyonu

1.  **Görev:** Faz A'da oluşturulan tüm yeni bileşen dosyalarını (`DashboardHeader.jsx`, `FeatureCard.jsx` vb.) aç.
2.  **Renkleri Güncelle:** Tüm hard-coded renk kodlarını (`from-[#00ff88]`, `border-blue-500/20` vb.) `GEMINI.md`'deki **Dark Theme** paletindeki standart Tailwind sınıflarıyla değiştir. (Örn: `from-green-500`, `to-cyan-500`, `border-slate-700/50`, `text-slate-300`).
3.  **Atomik Bileşenleri Kullan:**
    *   `FeatureCard.jsx` ve `RightSidebar.jsx` içindeki ana `div`'leri `<Card>` bileşeniyle değiştir.
    *   Gelecekte eklenecek butonlar için `<Button>` bileşenini kullanmaya hazır hale getir.
    *   Başlıkları (`h1`, `h3`) ve paragrafları (`p`) standart `Typography` bileşenleriyle (varsa) veya standart metin sınıflarıyla (`text-2xl`, `text-slate-100` vb.) güncelle.

#### Faz E: ERS Kodlarını Ekleme ve Düzeltme

1.  **Görev:** `ArkadeDashboard.jsx` ve Faz A'da oluşturulan tüm yeni bileşen dosyalarını aç.
2.  **Düzelt:** `ArkadeDashboard.jsx` içindeki `data-registry` attribute'larını `data-ers` olarak değiştir.
3.  **Ekle:** Gelecekte interaktif olacak tüm elementlere (özellikle `FeatureCard`'ların tamamına ve `RightSidebar` içindeki linklere) uygun hiyerarşide `data-ers` kodları ekle. (Örn: `2.B.1.1` - Birinci Feature Card).

---

### **BÖLÜM 4: SONUÇLANDIRMA**

#### Faz F: Son Temizlik ve Doğrulama

1.  **Görev:** `ArkadeDashboard.jsx` dosyasını aç.
2.  **Temizle:** Refactor sonrası artık kullanılmayan importları veya değişkenleri (varsa) kaldır.
3.  **Doğrula:** Sayfanın görsel olarak bozulmadığından emin ol.
4.  **Kontrol Et:** Projenin `npm run lint` ve `npm run build` komutlarının hatasız çalıştığından emin ol.

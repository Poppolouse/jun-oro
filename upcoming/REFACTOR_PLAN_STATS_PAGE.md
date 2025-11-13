# Refactor Planı: StatsPage.jsx

**Ana Hedef:** `src/pages/StatsPage.jsx` sayfasını, gelecekteki işlevselliği kolayca eklenebilecek şekilde modüler, standartlara uygun ve atomik bileşen yapısına sahip bir hale getirmek.

---

### **BÖLÜM 1: BİLEŞEN YAPISINI OLUŞTURMA**

#### Faz A: Bileşen Dosyalarını Oluşturma (Stubbing)

1.  **Görev:** Aşağıdaki boş bileşen dosyalarını oluştur. Diğer planlarda zaten oluşturulmuş olanları (`FeatureCard`, `StatCard`) atla.
    *   `src/components/Stats/StatsHeader.jsx`
    *   `src/components/shared/FeatureCard.jsx` (Yeniden kullanılacak)
    *   `src/components/Stats/SampleStats.jsx`
    *   `src/components/shared/StatCard.jsx` (Yeniden kullanılacak)
    *   `src/components/Stats/ComingSoonFooter.jsx`
    *   `src/components/Stats/RightSidebar.jsx`

---

### **BÖLÜM 2: JSX ve STİL MİGRASYONU**

#### Faz B: Statik JSX Kodunu Bileşenlere Taşıma

1.  **`StatsHeader.jsx`:**
    *   **Taşı:** `StatsPage.jsx` içindeki ana başlık (`h1`), "Çok Yakında" rozeti ve ana açıklamayı (`p`) içeren JSX kodunu `StatsHeader.jsx` içine taşı.
2.  **`FeatureCard.jsx`:**
    *   **Kullan:** "Özellikler Grid" bölümündeki 6 kart için daha önce oluşturulan `FeatureCard` bileşenini kullan.
3.  **`SampleStats.jsx`:**
    *   **Taşı:** "Örnek İstatistik Görünümü" bölümünün tamamını (başlık ve grid) `SampleStats.jsx` içine taşı.
4.  **`StatCard.jsx`:**
    *   **Kullan:** `SampleStats` içindeki 3 istatistik için daha önce oluşturulan `StatCard` bileşenini kullan.
5.  **`ComingSoonFooter.jsx`:**
    *   **Taşı:** Sayfanın en altındaki bilgilendirme kutusunun JSX kodunu `ComingSoonFooter.jsx` içine taşı.
6.  **`RightSidebar.jsx`:**
    *   **Taşı:** Sayfanın sağındaki dikey "sidebar" bölümünün tüm JSX kodunu `RightSidebar.jsx` içine taşı.

#### Faz C: Ana Sayfayı Yeni Bileşenlerle Güncelleme

1.  **Görev:** `StatsPage.jsx` dosyasını aç.
2.  **Değiştir:** Faz B'de taşıdığın tüm JSX bloklarını, oluşturduğun yeni bileşenlerle değiştir.
    *   `<StatsHeader />`
    *   `FeatureCard` bileşenini 6 farklı `prop` ile 6 kez çağır.
    *   `<SampleStats />`
    *   `<ComingSoonFooter />`
    *   `<RightSidebar />`

---

### **BÖLÜM 3: STANDARTLARA UYUM**

#### Faz D: Tasarım Sistemi ve Atomik Bileşen Entegrasyonu

1.  **Görev:** Faz A'da oluşturulan tüm yeni bileşen dosyalarını aç.
2.  **Renkleri Güncelle:** Tüm hard-coded renk kodlarını (`from-blue-400`, `to-purple-400` vb.) `GEMINI.md`'deki **Dark Theme** paletindeki standart Tailwind sınıflarıyla değiştir.
3.  **Atomik Bileşenleri Kullan:**
    *   `FeatureCard`, `SampleStats`, `StatCard` ve `RightSidebar` içindeki ana `div`'leri `<Card>` bileşeniyle değiştir.
    *   Başlıkları (`h1`, `h3`) ve paragrafları (`p`) standart metin sınıflarıyla (`text-2xl`, `text-slate-100` vb.) güncelle.

#### Faz E: ERS Kodlarını Düzeltme ve Ekleme

1.  **Görev:** `StatsPage.jsx` ve Faz A'da oluşturulan tüm yeni bileşen dosyalarını aç.
2.  **Düzelt:** `data-registry` attribute'larını `data-ers` olarak değiştir.
3.  **Ekle/Doğrula:** Tüm interaktif elementlere uygun hiyerarşide `data-ers` kodları ekle veya mevcut kodların doğruluğunu kontrol et.

---

### **BÖLÜM 4: SONUÇLANDIRMA**

#### Faz F: Son Temizlik ve Doğrulama

1.  **Görev:** `StatsPage.jsx` dosyasını aç.
2.  **Temizle:** Refactor sonrası artık kullanılmayan importları veya değişkenleri (varsa) kaldır.
3.  **Doğrula:** Sayfanın görsel olarak bozulmadığından emin ol.
4.  **Kontrol Et:** Projenin `npm run lint` ve `npm run build` komutlarının hatasız çalıştığından emin ol.

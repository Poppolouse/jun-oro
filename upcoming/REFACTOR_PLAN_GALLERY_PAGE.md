# Refactor Planı: GalleryPage.jsx

**Ana Hedef:** `src/pages/GalleryPage.jsx` sayfasını, gelecekteki işlevselliği kolayca eklenebilecek şekilde modüler, standartlara uygun ve atomik bileşen yapısına sahip bir hale getirmek.

---

### **BÖLÜM 1: BİLEŞEN YAPISINI OLUŞTURMA**

#### Faz A: Bileşen Dosyalarını Oluşturma (Stubbing)

1.  **Görev:** Aşağıdaki boş bileşen dosyalarını oluştur. Diğer planlarda zaten oluşturulmuş olanları (`FeatureCard` gibi) atla.
    *   `src/components/Gallery/GalleryHeader.jsx`
    *   `src/components/shared/FeatureCard.jsx` (Yeniden kullanılacak)
    *   `src/components/Gallery/SampleGallery.jsx`
    *   `src/components/shared/StatCard.jsx` (Yeniden kullanılabilir bir istatistik kartı)
    *   `src/components/Gallery/ComingSoonFooter.jsx`
    *   `src/components/Gallery/RightSidebar.jsx`

---

### **BÖLÜM 2: JSX ve STİL MİGRASYONU**

#### Faz B: Statik JSX Kodunu Bileşenlere Taşıma

1.  **`GalleryHeader.jsx`:**
    *   **Taşı:** `GalleryPage.jsx` içindeki ana başlık (`h1`), "Çok Yakında" rozeti ve ana açıklamayı (`p`) içeren JSX kodunu `GalleryHeader.jsx` içine taşı.
2.  **`FeatureCard.jsx`:**
    *   **Kullan:** "Özellikler Grid" bölümündeki 6 kart için daha önce oluşturulan `FeatureCard` bileşenini kullan.
3.  **`SampleGallery.jsx`:**
    *   **Taşı:** "Örnek Galeri Görünümü" bölümünün tamamını (başlık ve grid) `SampleGallery.jsx` içine taşı.
4.  **`StatCard.jsx`:**
    *   **Taşı ve Props Oluştur:** İstatistikleri gösteren 3 karttan birinin JSX yapısını `StatCard.jsx` içine taşı. Bileşenin `value`, `label` ve `color` gibi `props` almasını sağla.
5.  **`ComingSoonFooter.jsx`:**
    *   **Taşı:** Sayfanın en altındaki bilgilendirme kutusunun JSX kodunu `ComingSoonFooter.jsx` içine taşı.
6.  **`RightSidebar.jsx`:**
    *   **Taşı:** Sayfanın sağındaki dikey "sidebar" bölümünün tüm JSX kodunu `RightSidebar.jsx` içine taşı.

#### Faz C: Ana Sayfayı Yeni Bileşenlerle Güncelleme

1.  **Görev:** `GalleryPage.jsx` dosyasını aç.
2.  **Değiştir:** Faz B'de taşıdığın tüm JSX bloklarını, oluşturduğun yeni bileşenlerle değiştir.
    *   `<GalleryHeader />`
    *   `FeatureCard` bileşenini 6 farklı `prop` ile 6 kez çağır.
    *   `<SampleGallery />`
    *   `StatCard` bileşenini 3 farklı `prop` ile 3 kez çağır.
    *   `<ComingSoonFooter />`
    *   `<RightSidebar />`

---

### **BÖLÜM 3: STANDARTLARA UYUM**

#### Faz D: Tasarım Sistemi ve Atomik Bileşen Entegrasyonu

1.  **Görev:** Faz A'da oluşturulan tüm yeni bileşen dosyalarını aç.
2.  **Renkleri Güncelle:** Tüm hard-coded renk kodlarını (`from-emerald-400`, `to-teal-400` vb.) `GEMINI.md`'deki **Dark Theme** paletindeki standart Tailwind sınıflarıyla değiştir.
3.  **Atomik Bileşenleri Kullan:**
    *   `FeatureCard`, `SampleGallery`, `StatCard` ve `RightSidebar` içindeki ana `div`'leri `<Card>` bileşeniyle değiştir.
    *   Başlıkları (`h1`, `h3`) ve paragrafları (`p`) standart metin sınıflarıyla (`text-2xl`, `text-slate-100` vb.) güncelle.

#### Faz E: ERS Kodlarını Düzeltme ve Ekleme

1.  **Görev:** `GalleryPage.jsx` ve Faz A'da oluşturulan tüm yeni bileşen dosyalarını aç.
2.  **Düzelt:** `data-registry` attribute'larını `data-ers` olarak değiştir.
3.  **Ekle/Doğrula:** Tüm interaktif elementlere uygun hiyerarşide `data-ers` kodları ekle veya mevcut kodların doğruluğunu kontrol et.

---

### **BÖLÜM 4: SONUÇLANDIRMA**

#### Faz F: Son Temizlik ve Doğrulama

1.  **Görev:** `GalleryPage.jsx` dosyasını aç.
2.  **Temizle:** Refactor sonrası artık kullanılmayan importları veya değişkenleri (varsa) kaldır.
3.  **Doğrula:** Sayfanın görsel olarak bozulmadığından emin ol.
4.  **Kontrol Et:** Projenin `npm run lint` ve `npm run build` komutlarının hatasız çalıştığından emin ol.

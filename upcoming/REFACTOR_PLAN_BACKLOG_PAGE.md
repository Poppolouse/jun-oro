# Refactor Planı: BacklogPage.jsx

**Ana Hedef:** `src/pages/BacklogPage.jsx` sayfasını, gelecekteki işlevselliği kolayca eklenebilecek şekilde modüler, standartlara uygun ve atomik bileşen yapısına sahip bir hale getirmek. Bu plan, `ArkadeDashboard` refactor planı ile paralellik göstermektedir ve aynı yeniden kullanılabilir bileşenleri kullanmayı hedefler.

---

### **BÖLÜM 1: BİLEŞEN YAPISINI OLUŞTURMA**

#### Faz A: Bileşen Dosyalarını Oluşturma (Stubbing)

1.  **Görev:** Aşağıdaki boş bileşen dosyalarını oluştur. `FeatureCard` gibi bileşenler `ArkadeDashboard` planında zaten oluşturulduysa, bu adımı atla.
    *   `src/components/Backlog/BacklogHeader.jsx`
    *   `src/components/shared/FeatureCard.jsx` (Eğer daha önce oluşturulmadıysa, `components/Dashboard` yerine `components/shared` altında oluşturulması daha mantıklıdır.)
    *   `src/components/Backlog/ComingSoonFooter.jsx`
    *   `src/components/Backlog/RightSidebar.jsx`

---

### **BÖLÜM 2: JSX ve STİL MİGRASYONU**

#### Faz B: Statik JSX Kodunu Bileşenlere Taşıma

1.  **`BacklogHeader.jsx`:**
    *   **Taşı:** `BacklogPage.jsx` içindeki ana başlık (`h1`), "Çok Yakında" rozeti ve ana açıklamayı (`p`) içeren JSX kodunu `BacklogHeader.jsx` içine taşı.
2.  **`FeatureCard.jsx`:**
    *   **Taşı (veya Kullan):** "Özellikler Grid" bölümündeki 6 karttan birinin JSX yapısını `FeatureCard.jsx` içine taşı (eğer daha önce yapılmadıysa).
    *   **Props Oluştur:** Bileşenin `icon`, `title` ve `description` gibi `props` almasını sağla.
3.  **`ComingSoonFooter.jsx`:**
    *   **Taşı:** Sayfanın en altındaki bilgilendirme kutusunun JSX kodunu `ComingSoonFooter.jsx` içine taşı.
4.  **`RightSidebar.jsx`:**
    *   **Taşı:** Sayfanın sağındaki dikey "sidebar" bölümünün tüm JSX kodunu `RightSidebar.jsx` içine taşı.

#### Faz C: Ana Sayfayı Yeni Bileşenlerle Güncelleme

1.  **Görev:** `BacklogPage.jsx` dosyasını aç.
2.  **Değiştir:** Faz B'de taşıdığın tüm JSX bloklarını, oluşturduğun yeni bileşenlerle değiştir.
    *   `<BacklogHeader />`
    *   Özellikler grid'i için, `FeatureCard` bileşenini 6 farklı `prop` ile 6 kez çağır.
    *   `<ComingSoonFooter />`
    *   `<RightSidebar />`

---

### **BÖLÜM 3: STANDARTLARA UYUM**

#### Faz D: Tasarım Sistemi ve Atomik Bileşen Entegrasyonu

1.  **Görev:** Faz A'da oluşturulan tüm yeni bileşen dosyalarını aç.
2.  **Renkleri Güncelle:** Tüm hard-coded renk kodlarını (`from-orange-400`, `to-red-400` vb.) `GEMINI.md`'deki **Dark Theme** paletindeki standart Tailwind sınıflarıyla değiştir. (Örn: `from-orange-500`, `to-red-600`, `border-slate-700/50`, `text-slate-300`).
3.  **Atomik Bileşenleri Kullan:**
    *   `FeatureCard.jsx` ve `RightSidebar.jsx` içindeki ana `div`'leri `<Card>` bileşeniyle değiştir.
    *   Başlıkları (`h1`, `h3`) ve paragrafları (`p`) standart metin sınıflarıyla (`text-2xl`, `text-slate-100` vb.) güncelle.

#### Faz E: ERS Kodlarını Ekleme

1.  **Görev:** `BacklogPage.jsx` ve Faz A'da oluşturulan tüm yeni bileşen dosyalarını aç.
2.  **Ekle:** Gelecekte interaktif olacak tüm elementlere (özellikle `FeatureCard`'ların tamamına ve `RightSidebar` içindeki linklere) uygun hiyerarşide `data-ers` kodları ekle.

---

### **BÖLÜM 4: SONUÇLANDIRMA**

#### Faz F: Son Temizlik ve Doğrulama

1.  **Görev:** `BacklogPage.jsx` dosyasını aç.
2.  **Temizle:** Refactor sonrası artık kullanılmayan importları veya değişkenleri (varsa) kaldır.
3.  **Doğrula:** Sayfanın görsel olarak bozulmadığından emin ol.
4.  **Kontrol Et:** Projenin `npm run lint` ve `npm run build` komutlarının hatasız çalıştığından emin ol.

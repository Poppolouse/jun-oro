# Refactor Planı: WishlistPage.jsx

**Ana Hedef:** `src/pages/WishlistPage.jsx` sayfasını, gelecekteki işlevselliği kolayca eklenebilecek şekilde modüler, standartlara uygun ve atomik bileşen yapısına sahip bir hale getirmek.

---

### **BÖLÜM 1: BİLEŞEN YAPISINI OLUŞTURMA**

#### Faz A: Bileşen Dosyalarını Oluşturma (Stubbing)

1.  **Görev:** Aşağıdaki boş bileşen dosyalarını oluştur. Diğer planlarda zaten oluşturulmuş olanları (`FeatureCard` gibi) atla.
    *   `src/components/Wishlist/WishlistHeader.jsx`
    *   `src/components/shared/FeatureCard.jsx` (Yeniden kullanılacak)
    *   `src/components/Wishlist/SampleWishlist.jsx`
    *   `src/components/Wishlist/WishlistItem.jsx`
    *   `src/components/Wishlist/ComingSoonFooter.jsx`
    *   `src/components/Wishlist/RightSidebar.jsx`

---

### **BÖLÜM 2: JSX ve STİL MİGRASYONU**

#### Faz B: Statik JSX Kodunu Bileşenlere Taşıma

1.  **`WishlistHeader.jsx`:**
    *   **Taşı:** `WishlistPage.jsx` içindeki ana başlık (`h1`), "Çok Yakında" rozeti ve ana açıklamayı (`p`) içeren JSX kodunu `WishlistHeader.jsx` içine taşı.
2.  **`FeatureCard.jsx`:**
    *   **Kullan:** "Özellikler Grid" bölümündeki 6 kart için daha önce oluşturulan `FeatureCard` bileşenini kullan.
3.  **`SampleWishlist.jsx`:**
    *   **Taşı:** "Örnek İstek listesi Görünümü" bölümünün tamamını (başlık ve grid) `SampleWishlist.jsx` içine taşı.
4.  **`WishlistItem.jsx`:**
    *   **Taşı ve Props Oluştur:** `SampleWishlist` içindeki 3 örnek oyundan birinin JSX yapısını `WishlistItem.jsx` içine taşı. Bileşenin `name`, `price`, `discount`, `store` gibi `props` almasını sağla.
5.  **`ComingSoonFooter.jsx`:**
    *   **Taşı:** Sayfanın en altındaki bilgilendirme kutusunun JSX kodunu `ComingSoonFooter.jsx` içine taşı.
6.  **`RightSidebar.jsx`:**
    *   **Taşı:** Sayfanın sağındaki dikey "sidebar" bölümünün tüm JSX kodunu `RightSidebar.jsx` içine taşı.

#### Faz C: Ana Sayfayı Yeni Bileşenlerle Güncelleme

1.  **Görev:** `WishlistPage.jsx` dosyasını aç.
2.  **Değiştir:** Faz B'de taşıdığın tüm JSX bloklarını, oluşturduğun yeni bileşenlerle değiştir.
    *   `<WishlistHeader />`
    *   `FeatureCard` bileşenini 6 farklı `prop` ile 6 kez çağır.
    *   `<SampleWishlist />` (Bu bileşen kendi içinde `WishlistItem`'ı 3 kez çağıracak)
    *   `<ComingSoonFooter />`
    *   `<RightSidebar />`

---

### **BÖLÜM 3: STANDARTLARA UYUM**

#### Faz D: Tasarım Sistemi ve Atomik Bileşen Entegrasyonu

1.  **Görev:** Faz A'da oluşturulan tüm yeni bileşen dosyalarını aç.
2.  **Renkleri Güncelle:** Tüm hard-coded renk kodlarını (`from-pink-400`, `to-purple-400` vb.) `GEMINI.md`'deki **Dark Theme** paletindeki standart Tailwind sınıflarıyla değiştir.
3.  **Atomik Bileşenleri Kullan:**
    *   `FeatureCard`, `SampleWishlist`, `WishlistItem` ve `RightSidebar` içindeki ana `div`'leri `<Card>` bileşeniyle değiştir.
    *   Başlıkları (`h1`, `h3`) ve paragrafları (`p`) standart metin sınıflarıyla (`text-2xl`, `text-slate-100` vb.) güncelle.

#### Faz E: ERS Kodlarını Ekleme

1.  **Görev:** `WishlistPage.jsx` ve Faz A'da oluşturulan tüm yeni bileşen dosyalarını aç.
2.  **Ekle:** Tüm interaktif elementlere uygun hiyerarşide `data-ers` kodları ekle.

---

### **BÖLÜM 4: SONUÇLANDIRMA**

#### Faz F: Son Temizlik ve Doğrulama

1.  **Görev:** `WishlistPage.jsx` dosyasını aç.
2.  **Temizle:** Refactor sonrası artık kullanılmayan importları veya değişkenleri (varsa) kaldır.
3.  **Doğrula:** Sayfanın görsel olarak bozulmadığından emin ol.
4.  **Kontrol Et:** Projenin `npm run lint` ve `npm run build` komutlarının hatasız çalıştığından emin ol.

# HomePage.jsx - Atomik Sisteme Geçiş Planı

**Ana Hedef:** `HomePage.jsx` dosyasını ve onun render ettiği elementleri, standart `ui` bileşenlerini kullanacak, tasarım sistemine tam uyumlu ve daha modüler bir yapıya kavuşturmak.

---

### Faz A: Mantığı Hook'lara Taşıma
- **Sorun:** Saat, tarih ve uygulama sayfalama mantığı doğrudan `HomePage` bileşeni içinde yönetiliyor.
- **Görev 1:** `LiveClock` bileşenindeki saat ve tarih formatlama mantığını, `useClock` adında yeni bir custom hook'a (`src/hooks/useClock.js`) taşı. Bu hook, `time` ve `date` değerlerini formatlanmış olarak döndürmeli. `LiveClock` bileşeni bu hook'u kullanmalı.
- **Görev 2:** Uygulama listesi ve sayfalama mantığını (`applications`, `appsPerPage`, `currentPage`, `setCurrentPage` vb.) `useAppLauncher` adında yeni bir custom hook'a (`src/hooks/useAppLauncher.js`) taşı. Bu hook, `currentApps`, `pagination` detaylarını ve `changePage` fonksiyonunu döndürmeli. `HomePage` bu hook'u kullanmalı.

### Faz B: "Uygulama Kartı"nı Bileşene Çevirme
- **Sorun:** Uygulamaları listeleyen kart (`<div key={app.id} ...>`) ve içindeki tüm yapı, `HomePage.jsx` içinde `map` döngüsüyle oluşturuluyor. Bu, kod tekrarına ve karmaşıklığa yol açıyor.
- **Görev 1:** `src/components/` altında `AppCard.jsx` adında yeni bir bileşen oluştur.
- **Görev 2:** `HomePage.jsx`'teki `map` döngüsünün içindeki tüm JSX kodunu `AppCard.jsx`'e taşı.
- **Görev 3:** `AppCard.jsx`'in `app` nesnesini (veya `name`, `icon`, `status`, `description` gibi değerleri) ve `onClick` fonksiyonunu prop olarak almasını sağla.
- **Görev 4:** `HomePage.jsx`'teki `map` döngüsünü, sadece `<AppCard key={app.id} app={app} />` render edecek şekilde basitleştir.

### Faz C: Ham HTML Elementlerini Standart UI Bileşenleriyle Değiştirme
- **Sorun:** Sayfada standart `Button` ve `InputField` yerine, özel `className`'ler ile stil verilmiş `<button>` ve `<input>` elementleri kullanılıyor.
- **Görev 1 (Arama Çubuğu):** Arama çubuğundaki `<input>` elementini, standart `<InputField disabled placeholder="..." />` bileşeniyle değiştir.
- **Görev 2 (Uygulama Kartı Butonu):** `AppCard.jsx` içindeki "Uygulamayı Aç" butonunu, `<Button disabled={...}>Uygulamayı Aç</Button>` bileşeniyle değiştir.
- **Görev 3 (Sayfalama Butonları):** Sayfalama bölümündeki "Önceki", "Sonraki" ve sayfa numarası butonlarının tamamını, standart `<Button>` bileşeniyle değiştir. Mevcut durum (`currentPage === i`) için `variant="primary"` veya benzeri bir prop kullanılabilir.

### Faz D: Tasarım Sistemi ve Stil Uyumluluğu
- **Sorun:** Renkler (`from-slate-900`, `text-gray-400`) ve bazı stiller doğrudan `className` içinde tanımlanmış. Bunlar `GEMINI.md`'deki kurallarla tam eşleşmeli.
- **Görev 1:** Sayfadaki tüm renk kullanımlarını (`bg-`, `text-`, `border-`) gözden geçir ve `GEMINI.md`'deki "Dark Theme" paletiyle (örn: Card/Section Arkaplanı, Ana Metin, İkincil Metin) tam uyumlu hale getir.
- **Görev 2:** `AppCard.jsx`'in ana `div`'ini, standart `<Card interactive={app.status === 'active'}>` bileşeniyle değiştirmeyi değerlendir. Bu, gölge ve hover efektlerinde tam tutarlılık sağlar.

### Faz E: ERS Kodlarını Gözden Geçirme
- **Sorun:** `data-registry` adıyla bir ERS sistemi kullanılmış. Bu, standart olan `data-ers` ile değiştirilmelidir.
- **Görev 1:** Dosyadaki tüm `data-registry` attribute'larını `data-ers` olarak yeniden adlandır.
- **Görev 2:** Hiyerarşinin (`1.0.B4.2.1` gibi) projenin genel ERS mantığına uygun olup olmadığını kontrol et ve gerekirse düzelt.

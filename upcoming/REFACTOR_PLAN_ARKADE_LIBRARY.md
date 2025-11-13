# ArkadeLibrary.jsx - Atomik Sisteme Geçiş Planı

**Ana Hedef:** Devasa `ArkadeLibrary.jsx` dosyasını, her biri tek bir iş yapan daha küçük, yönetilebilir ve yeniden kullanılabilir bileşenlere ve hook'lara bölmek.

---

### Faz A: En Büyük Parça - `LibraryCyclePlanner`'ı Ayırma
- **Sorun:** `LibraryCyclePlanner` bileşeni, kütüphaneden tamamen ayrı bir özellik olmasına rağmen aynı dosya içinde yer alıyor ve dosyayı şişiriyor.
- **Görev 1:** `src/components/Library/` altında `LibraryCyclePlanner.jsx` adında yeni bir dosya oluştur.
- **Görev 2:** `ArkadeLibrary.jsx` içindeki `LibraryCyclePlanner` fonksiyonunun tamamını bu yeni dosyaya taşı.
- **Görev 3:** `ArkadeLibrary.jsx`'te, `activeTab === 'cycle'` olduğunda bu yeni bileşeni import edip kullan.

### Faz B: Tüm Mantığı `useArkadeLibrary` Hook'una Taşıma
- **Sorun:** Filtreleme, sıralama, arama, sayfalama, veri yükleme, oyun silme/ekleme/güncelleme gibi tüm mantık, `LibraryContent` bileşeninin içinde dağınık halde duruyor.
- **Görev 1:** `src/hooks/` altında `useArkadeLibrary.js` adında yeni bir custom hook oluştur.
- **Görev 2:** `LibraryContent` içindeki **tüm `useState` ve `useEffect` hook'larını** bu yeni `useArkadeLibrary.js` dosyasına taşı.
- **Görev 3:** `handleGameAdded`, `performDelete`, `toggleSelect` gibi tüm yardımcı ve olay fonksiyonlarını da bu hook'a taşı.
- **Görev 4:** `useArkadeLibrary` hook'unun, bileşenin ihtiyaç duyacağı her şeyi (örn: `games`, `loading`, `searchText`, `setSearchText`, `filteredGames`, `deleteGame`) tek bir nesne içinde döndürmesini sağla.
- **Görev 5:** `LibraryContent` bileşenini, sadece `const library = useArkadeLibrary();` şeklinde bu hook'u kullanacak ve render edeceği JSX içinde `library.games`, `library.searchText` gibi değerleri kullanacak şekilde basitleştir.

### Faz C: Arayüzü Bileşenlere Ayırma (Componentization)
- **Sorun:** `LibraryContent`'in `return` bloğu çok büyük ve birçok farklı bölümü (header, filtreler, oyun listesi) içeriyor.
- **Görev 1 - `LibraryControls.jsx`:** Filtreleme ve arama çubuğunu içeren `div id="filters-panel"` kısmını, `src/components/Library/LibraryControls.jsx` adında yeni bir bileşene taşı. Bu bileşen, `searchText`, `sortOption` gibi değerleri ve `onChange` fonksiyonlarını prop olarak almalı.
- **Görev 2 - `GameCard.jsx`:** `renderGameCard` fonksiyonunun içindeki tüm JSX'i, `src/components/Library/GameCard.jsx` adında yeni bir bileşene taşı. Bu bileşen, `game` nesnesini ve `onSelect`, `onEdit`, `onDelete` gibi fonksiyonları prop olarak almalı.
- **Görev 3 - `GameList.jsx`:** Oyunların `map` ile render edildiği `div id="games-list"` kısmını, `src/components/Library/GameList.jsx` adında yeni bir bileşene taşı. Bu bileşen, `games` dizisini prop olarak alıp `GameCard`'ları render etmeli.

### Faz D: Ham HTML Elementlerini Standart UI Bileşenleriyle Değiştirme
- **Sorun:** Sayfada çok sayıda standart dışı `<button>`, `<input>`, `<select>` ve `<div>`'den bozma modal kullanılıyor.
- **Görev 1:** `LibraryControls.jsx` içindeki `<input>` ve `<select>` elementlerini, standart `<InputField>` ve `<SelectField>` (eğer yoksa oluşturulmalı) bileşenleriyle değiştir.
- **Görev 2:** `GameCard.jsx` içindeki "Düzenle", "Sil", "Play" gibi tüm `<button>`'ları, standart `<Button iconOnly variant="...">` bileşeniyle değiştir.
- **Görev 3:** Sayfalama (`pagination`) bölümündeki tüm butonları standart `<Button>` bileşeniyle değiştir.
- **Görev 4:** Silme onayı için kullanılan `div` yapısını, standart bir `<Modal>` veya `<ConfirmDialog>` bileşeniyle değiştir.

### Faz E: Stil ve ERS Kodu Uyumluluğu
- **Görev 1:** Dosyadaki tüm `data-registry` attribute'larını `data-ers` olarak yeniden adlandır.
- **Görev 2:** Tüm yeni oluşturulan bileşenlerde (`GameCard`, `LibraryControls` vb.) renklerin, boşlukların ve diğer stillerin `GEMINI.md`'deki "Dark Theme" ile uyumlu olduğundan emin ol. Hard-coded renkleri (`#00ff88`) tema renkleriyle değiştir.

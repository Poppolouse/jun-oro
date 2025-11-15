# Tasarım Editörü - Adım Adım Uygulama Talimatnamesi (Hata Toleranssız)

**Giriş:**
Bu belge, Tasarım Editörü özelliğinin sıfırdan, hatasız bir şekilde uygulanması için hazırlanmış, adım adım bir talimatnamedir. Bu kılavuzda **kod blokları bulunmamaktadır**. Bunun yerine, her bir component'in ve fonksiyonun nasıl yazılması gerektiği, hangi hook'ların kullanılacağı, hangi state'lerin tutulacağı ve hangi mimari kurallara uyulması gerektiği **açık ve net bir dille** tarif edilmiştir.

Aşağıdaki adımlar, belirtilen sırada ve **tarif edilen mantığa harfiyen uyularak** uygulanmalıdır. Herhangi bir varsayımda bulunmak veya tarif edilen mimarinin dışına çıkmak, daha önce karşılaşılan hataların (performans, hatalı ölçeklenme, takılma) geri gelmesine neden olacaktır.

---

### **Adım 1: Projeyi Temizle (Sıfırdan Başlangıç)**

**Talimat:** Önceki denemelerden kalan hatalı kodları tamamen temizle.

1.  `src/components/design-editor/` klasörünü ve içindeki tüm dosyaları sil.
2.  `src/contexts/DesignEditorContext.jsx` dosyasını sil.
3.  `src/components/resizeUtils.js` veya benzeri yardımcı dosyaları sil.
4.  `src/App.jsx` ve `src/components/Header.jsx` dosyalarında `DesignEditor` ile ilgili tüm `import` ve kullanımları geçici olarak kaldır.

---

### **Adım 2: Merkezi State Context'ini Oluştur**

**Talimat:** Projenin state yönetimini yapacak olan `DesignEditorContext`'i, istenen tüm yeni özellikleri destekleyecek şekilde oluştur.

1.  `src/contexts/` klasörü içinde `DesignEditorContext.jsx` adında yeni bir dosya oluştur.
2.  Bu dosyanın içine, `useReducer` kullanan bir React Context'i implemente et.
3.  `initialState` objesi şu alanları içermelidir:
    *   `mode`: `'inactive'`, `'select'`, veya `'design'` değerlerini alabilen bir string.
    *   `hoveredElement`, `selectedElement`: `null` veya `{ element, ers, name }` şeklinde bir obje.
    *   `selectionLocked`: `boolean`.
    *   `infoBox`: `{ position: { x, y }, visible: boolean }` şeklinde bir obje. Varsayılan pozisyonu ekranın sağ üstü olarak ayarla.
    *   `dock`: `{ position: { x, y }, visible: boolean }` şeklinde bir obje. Varsayılan pozisyonu ekranın alt-ortası olarak ayarla.
    *   `toast`: `{ visible: boolean, message: string, ers: string }` şeklinde bir obje. ERS kopyalama bildirimi için.
4.  `designEditorReducer` fonksiyonunu oluştur. Bu fonksiyon, aşağıdaki `action.type`'ları işlemelidir:
    *   `SET_MODE`: `mode`'u değiştirirken, `dock` ve `infoBox`'ın görünürlüğünü de yeni moda göre ayarla. Örneğin, `select` moduna geçince seçimi temizle.
    *   `SET_HOVERED_ELEMENT`: `hoveredElement` state'ini günceller.
    *   `SET_SELECTED_ELEMENT`: `selectedElement`'ı ayarlar, `selectionLocked`'ı `true` yapar ve `dock` ile `infoBox`'ı görünür kılar.
    *   `CLEAR_SELECTION`: `selectedElement` ve `selectionLocked`'ı sıfırlar, `dock` ve `infoBox`'ı gizler.
    *   `SET_INFOBOX_POSITION`, `SET_DOCK_POSITION`: İlgili pencerelerin pozisyonlarını günceller.
    *   `SHOW_TOAST`, `HIDE_TOAST`: ERS kopyalama bildirimini yönetir.

---

### **Adım 3: Gerekli Component'leri ve Yardımcı Fonksiyonları Oluştur**

**Talimat:** `design-editor` modunun ihtiyaç duyacağı temel dosyaları oluştur.

1.  `src/utils/` klasöründe `domUtils.js` adında bir dosya oluştur. İçine, bir DOM elementini (`target`) alıp `data-ers` attribute'una sahip en yakın parent'ını bulan ve `{ element, ers, name }` objesi döndüren `getElementInfo` adında bir fonksiyon yaz. Bu fonksiyon, `data-design-editor-ignore="true"` attribute'una sahip elementleri yok saymalıdır.

2.  `src/components/` altında `design-editor` klasörünü oluştur.

3.  Bu klasörün içine `EventOverlay.jsx` dosyasını oluştur.
    *   Bu component hiçbir şey render etmemelidir (`return null`).
    *   `useEffect` kullanarak, `mode` state'i `inactive` değilken `window` üzerine `mousemove`, `click` ve `contextmenu` olay dinleyicileri eklemelidir.
    *   `handleMouseMove`: `selectionLocked` değilse, `getElementInfo` ile fare altındaki elementi bulup `SET_HOVERED_ELEMENT` dispatch etmelidir. Performans için, sadece fare farklı bir elementin üzerine geldiğinde dispatch yapmalıdır.
    *   `handleClick`: `design` modunda ve `selectionLocked` değilken, tıklanan element için `SET_SELECTED_ELEMENT` dispatch etmelidir.
    *   `handleContextMenu`: `select` modundayken, sağ tıklanan elementin ERS kodunu `navigator.clipboard.writeText` ile kopyalamalı ve `SHOW_TOAST` dispatch etmelidir.

4.  `design-editor` klasörünün içine `ToastNotification.jsx` dosyasını oluştur.
    *   Bu component, `useDesignEditor`'dan `toast` state'ini okumalıdır.
    *   `toast.visible` `true` ise, `createPortal` kullanarak ekranın ortasında ERS kodunu ve mesajı gösteren bir bildirim kutusu render etmelidir.
    *   Bir `useEffect` içinde, `toast.visible` `true` olduğunda 2 saniye sonra `HIDE_TOAST` dispatch eden bir `setTimeout` kurmalıdır.

---

### **Adım 4: KRİTİK ADIM - Stabil `Highlighter.jsx` Component'ini Uygula**

**Talimat:** Bu adım, projenin en önemli adımıdır. `src/components/design-editor/Highlighter.jsx` dosyasını, aşağıdaki mimari ve mantığa **harfiyen** uyarak yaz. Bu mimari, daha önce karşılaşılan **TÜM** sorunları çözecektir.

1.  **Component Yapısı ve State'ler:**
    *   `useDesignEditor`'dan `state`'i al. `hoveredElement` ve `selectedElement`'ı state'ten çıkar.
    *   İki adet local state tanımla: `hoverRect` ve `selectRect`. Bunlar `getBoundingClientRect` sonuçlarını tutacak.
    *   Bir adet `dragRef` (`useRef`) tanımla. Bu ref, sürükleme boyunca anlık ama render'ı tetiklemeyecek verileri tutacak: `{ active, type, startX, startY, startRect, childSnapshots }`.

2.  **`useEffect` Hook'ları (State Senkronizasyonu):**
    *   Bir `useEffect`, `hoveredElement` değiştikçe `hoverRect` state'ini güncellesin.
    *   Bir `useEffect`, `selectedElement` değiştikçe `selectRect` state'ini güncellesin.

3.  **Yeniden Boyutlandırma Mimarisi (Fonksiyonlar):**
    *   **`handleMove` Fonksiyonu:**
        *   `useCallback` ile ve boş bağımlılık dizisi `[]` ile tanımlanmalıdır.
        *   İçinde, `dragRef.current.active` değilse hemen çıkmalıdır.
        *   `requestAnimationFrame` kullanarak, `dragRef`'ten alınan başlangıç değerleri ve anlık fare pozisyonuna göre yeni `width`, `height`, `left`, `top` değerlerini hesaplamalıdır.
        *   **MİMARİ KURALI:** Bu fonksiyonun tek görevi, hesapladığı yeni dörtgen bilgisiyle `setSelectRect`'i çağırmaktır. Asla ve asla DOM'a dokunmamalıdır.
    *   **`handleUp` Fonksiyonu:**
        *   `useCallback` ile ve `[selectedElement, handleMove]` bağımlılıklarıyla tanımlanmalıdır.
        *   İçinde, `dragRef.current.active` değilse hemen çıkmalıdır.
        *   `window` üzerindeki `mousemove` ve `mouseup` dinleyicilerini kaldırmalıdır.
        *   `setSelectRect`'in fonksiyonel güncelleme formunu (`setSelectRect(currentRect => { ... })`) kullanarak `finalRect`'i (en güncel dörtgen bilgisi) almalıdır.
        *   **MİMARİ KURALI (Parent Boyutlandırma):** `selectedElement.element`'in `style.width` ve `style.height`'ını, `finalRect`'e göre **tek bir seferde** ayarlamalıdır.
        *   **MİMARİ KURALI (Çocuk Ölçeklendirme):** `dragRef.current.childSnapshots` dizisi üzerinde bir döngü başlatmalıdır. Her bir çocuk için, `finalRect` ve snapshot'taki oranları kullanarak yeni `width`, `height`, `left`, `top` değerlerini hesaplamalı ve çocuğun stiline uygulamalıdır. Bu, orantısal ölçeklenmeyi garanti eder.
        *   Son olarak, `dragRef.current.active`'i `false` yapmalıdır.
    *   **`handleMouseDownOnHandle` Fonksiyonu:**
        *   `useCallback` ile ve `[selectRect, selectedElement, handleMove, handleUp]` bağımlılıklarıyla tanımlanmalıdır. Bu, bir `type` parametresi alıp bir event handler döndüren bir "higher-order function" olmalıdır.
        *   İçinde, `e.preventDefault()` ve `e.stopPropagation()` çağırmalıdır.
        *   **Orantısal Ölçeklendirme Hazırlığı:** `selectedElement.element.children` üzerinde bir döngü başlatmalıdır. Her bir çocuğun, o anki parent'a göre yüzde bazlı boyut (`widthRatio`, `heightRatio`) ve pozisyon (`leftRatio`, `topRatio`) oranlarını hesaplamalıdır. Bu bilgiyi bir `childSnapshots` dizisi olarak `dragRef.current`'a kaydetmelidir.
        *   `dragRef.current`'ı `active: true` ve diğer başlangıç değerleriyle (`startX`, `startY`, `startRect`) güncellemelidir.
        *   `window.addEventListener` ile `handleMove` ve `handleUp`'ı `window`'a eklemelidir.

4.  **Render Mantığı:**
    *   Component, `createPortal` kullanarak bir `div`'i `document.body`'ye render etmelidir.
    *   Bu `div` içinde, `hoverRect` ve `selectRect` state'lerine göre vurgulama kutularını (`Box` adında bir yardımcı component) render etmelidir.
    *   `selectRect` varsa, 8 adet yeniden boyutlandırma "handle"ını (küçük `div`'ler) `selectRect`'in kenarlarına ve köşelerine göre mutlak pozisyonla yerleştirmelidir. Her bir handle'ın `onMouseDown` olayına `handleMouseDownOnHandle`'ı uygun `type` ile bağlamalıdır.

---

### **Adım 5: Ana Uygulama Dosyalarını Güncelle**

**Talimat:** Oluşturulan yeni altyapıyı uygulamaya dahil et.

1.  `src/App.jsx` dosyasını aç. `DesignEditorProvider`'ı, `AuthProvider`'dan sonra ama diğer provider'lardan önce gelecek şekilde tüm uygulamayı sarmala. `App` component'inin render bloğunun içine, `<AppRoutes />`'dan sonra `<EventOverlay />`, `<Highlighter />` ve `<ToastNotification />` component'lerini ekle.

2.  `src/components/Header.jsx` dosyasını aç. Eski `button`'ları kaldır. Bunun yerine, `AdminToggleSwitch` adında yeni bir yardımcı component oluştur. Bu component, `activeMode` prop'una göre stil değiştiren bir `button` olmalı. `Header` içinde, "Seç" ve "Tasarla" için iki adet `AdminToggleSwitch` render et. Bu butonların `onClick` olayları, `useDesignEditor`'dan alınan `dispatch` ile `SET_MODE` eylemini tetiklemelidir.

---

**Sonuç:**
Bu talimatname harfiyen takip edildiğinde, projenin temel altyapısı, ERS kopyalama özelliği ve en önemlisi, **stabil ve performanslı yeniden boyutlandırma özelliği** çalışır hale gelecektir. Diğer özellikler (Dock, InfoBox, Sürükle-Bırak) bu sağlam temel üzerine inşa edilebilir.

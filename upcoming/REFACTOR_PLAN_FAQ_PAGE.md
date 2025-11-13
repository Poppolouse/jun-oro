# Refactor Planı: FAQPage.jsx

**Ana Hedef:** `src/pages/FAQPage.jsx` "God Component" yapısını tamamen ortadan kaldırmak. Sayfayı, her biri tek bir sorumluluğa sahip, yeniden kullanılabilir ve standartlara uygun atomik bileşenlere bölmek. Veri ve iş mantığını UI'dan ayırmak.

---

### **BÖLÜM 1: VERİ ve MANTIK AYRIŞTIRMA**

#### Faz A: Veriyi Taşıma

1.  **Görev:** `FAQPage.jsx` içindeki devasa `faqData` array'ini kes.
2.  **Oluştur ve Yapıştır:** `src/data/faqData.js` adında yeni bir dosya oluştur ve kestiğin `faqData` array'ini bu dosyaya yapıştır. `export default faqData;` satırını ekle.
3.  **Güncelle:** `FAQPage.jsx` dosyasına `import faqData from '../data/faqData';` satırını ekle.

#### Faz B: İş Mantığını Hook'a Taşıma

1.  **Görev:** `src/hooks/useFaq.js` adında yeni bir dosya oluştur.
2.  **Taşı:** `FAQPage.jsx` içindeki aşağıdaki state ve fonksiyonları `useFaq.js` hook'una taşı:
    *   Tüm `useState` tanımlamaları (`searchTerm`, `selectedCategory`, `expandedItems`, `helpfulVotes` vb.).
    *   Tüm `useMemo` tanımlamaları (`filteredFAQs`, `popularQuestions`).
    *   Tüm yardımcı fonksiyonlar (`getRelatedQuestions`, `toggleQuestion`, `handleHelpfulVote`, `handleCategoryFilter`).
3.  **Dönüş Değeri:** `useFaq` hook'unun, bileşenlerin ihtiyaç duyacağı tüm state'leri ve fonksiyonları bir obje içinde dönmesini sağla.
    *   Örnek: `{ searchTerm, setSearchTerm, filteredFAQs, popularQuestions, toggleQuestion, ... }`
4.  **Güncelle:** `FAQPage.jsx` içinde, sildiğin tüm mantığın yerine `const { ... } = useFaq();` satırını ekle.

---

### **BÖLÜM 2: BİLEŞENLERE AYIRMA**

#### Faz C: Bileşen Dosyalarını Oluşturma (Stubbing)

1.  **Görev:** Aşağıdaki boş bileşen dosyalarını oluştur:
    *   `src/components/FAQ/FAQHeader.jsx`
    *   `src/components/FAQ/FAQSearch.jsx`
    *   `src/components/FAQ/PopularQuestions.jsx`
    *   `src/components/FAQ/FAQCategory.jsx`
    *   `src/components/FAQ/FAQItem.jsx`
    *   `src/components/FAQ/NewQuestionModal.jsx`
    *   `src/components/FAQ/HelpRequestModal.jsx`

#### Faz D: JSX Kodunu Bileşenlere Taşıma

1.  **`FAQHeader.jsx`:** Ana başlık ve alt başlık JSX'ini bu dosyaya taşı.
2.  **`FAQSearch.jsx`:** Arama `input`'u ve kategori `select`'ini içeren JSX'i bu dosyaya taşı. Gerekli `props`'ları (`searchTerm`, `setSearchTerm`, `selectedCategory`, `handleCategoryFilter`) almasını sağla.
3.  **`PopularQuestions.jsx`:** Popüler sorular bölümünün JSX'ini bu dosyaya taşı. `props` olarak `popularQuestions` ve `toggleQuestion` fonksiyonunu almalı.
4.  **`FAQCategory.jsx`:** Tek bir kategori başlığını ve içindeki soru listesini (`.map` döngüsü) render eden JSX'i bu dosyaya taşı.
5.  **`FAQItem.jsx`:** Tek bir soru-cevap "accordion" elemanının JSX'ini bu dosyaya taşı. `isExpanded`, `question`, `helpfulVotes` gibi `props`'ları almalı ve `toggleQuestion`, `handleHelpfulVote` gibi fonksiyonları çağırmalı.
6.  **`NewQuestionModal.jsx`:** "Yeni Soru Ekle" modal'ının tüm JSX ve form mantığını bu dosyaya taşı.
7.  **`HelpRequestModal.jsx`:** "Yardım İsteği" modal'ının tüm JSX ve form mantığını bu dosyaya taşı.

#### Faz E: Ana Sayfayı Yeni Bileşenlerle Yeniden Oluşturma

1.  **Görev:** `FAQPage.jsx` dosyasının `return` bloğunu tamamen temizle.
2.  **Yeniden Yaz:** Sayfayı, oluşturduğun yeni bileşenleri kullanarak yeniden inşa et. Sayfa artık sadece bir layout ve bileşen orchestrator görevi görmelidir.

---

### **BÖLÜM 3: STANDARTLARA UYUM**

#### Faz F: Tasarım Sistemi ve Atomik Bileşen Entegrasyonu

1.  **Görev:** Faz C'de oluşturulan tüm yeni bileşen dosyalarını aç.
2.  **Temayı Değiştir:** Tüm açık tema renklerini (`bg-gray-50`, `text-gray-800`, `bg-blue-100` vb.) `GEMINI.md`'deki **Dark Theme** paletindeki standart Tailwind sınıflarıyla değiştir. (Örn: `bg-gray-900`, `text-slate-100`, `bg-slate-800/50`).
3.  **Atomik Bileşenleri Kullan:**
    *   `div`'leri `<Card>` ile değiştir.
    *   `button`'ları `<Button>` ile değiştir.
    *   `input` ve `textarea`'ları `<InputField>` ile değiştir.
    *   `select`'i `<Select>` ile değiştir.
    *   `react-icons` kullanımını, projenin standart ikon kütüphanesiyle (varsa) veya `<span>` içine alınmış SVG'lerle değiştir.

#### Faz G: ERS Kodlarını Doğrulama

1.  **Görev:** Tüm yeni bileşenlerdeki `data-ers` attribute'larının hiyerarşik olarak doğru ve tutarlı olduğundan emin ol.

---

### **BÖLÜM 4: SONUÇLANDIRMA**

#### Faz H: Son Temizlik ve Doğrulama

1.  **Görev:** `FAQPage.jsx` ve oluşturulan tüm yeni dosyalardaki gereksiz import'ları ve değişkenleri temizle.
2.  **Doğrula:** Sayfanın tüm işlevselliğinin (arama, filtreleme, aç/kapa, oylama, modal açma) doğru çalıştığından emin ol.
3.  **Kontrol Et:** Projenin `npm run lint -- --fix` ve `npm run build` komutlarının hatasız çalıştığından emin ol.

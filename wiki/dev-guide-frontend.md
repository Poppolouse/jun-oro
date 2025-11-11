# Frontend Kılavuzu

Bu kılavuz, Jun-Oro'nun frontend kod tabanıyla çalışmak için bilmeniz gereken temel kavramları ve standartları açıklar.

---

### Frontend Teknolojileri

*   **React 18:** Kullanıcı arayüzünü oluşturmak için temel kütüphane.
*   **Vite:** Hızlı geliştirme ve derleme (build) aracı.
*   **React Router:** Uygulama içi sayfa yönlendirmeleri (routing) için kullanılır.
*   **Tailwind CSS:** Stil işlemleri için kullanılan "utility-first" bir CSS çatısıdır.
*   **Lucide React:** İkon seti.

---

### Klasör Yapısı (`/src`)

Frontend kodu, sorumluluklarına göre aşağıdaki klasörler altında organize edilmiştir:

*   **`assets/`**: Resimler, fontlar gibi statik varlıkları içerir.
*   **`components/`**: Uygulama genelinde yeniden kullanılabilen React bileşenleri (örn: `Button.jsx`, `GameCard.jsx`).
    *   **Prensip:** Bir bileşen birden fazla sayfada kullanılıyorsa veya karmaşık bir mantığa sahipse, bu klasörde olmalıdır.
*   **`contexts/`**: Global state yönetimi için kullanılan React Context'lerini barındırır (örn: `AuthContext.jsx`).
*   **`hooks/`**: Tekrarlanan mantığı (örn: API'den veri çekme, local storage yönetimi) soyutlayan özel React hook'ları (örn: `useApi.js`).
*   **`pages/`**: Uygulamanın her bir sayfasını temsil eden ana bileşenler (örn: `HomePage.jsx`, `SettingsPage.jsx`). Bu bileşenler, genellikle `components` klasöründeki daha küçük bileşenleri bir araya getirir.
*   **`services/`**: Backend API'sine yapılan HTTP isteklerini yöneten fonksiyonları içerir.
*   **`utils/`**: Yardımcı fonksiyonları (tarih formatlama, veri dönüştürme vb.) barındırır.

---

### Stil: Tailwind CSS

Bu projede stil işlemleri için **Tailwind CSS** kullanılmaktadır. Ayrı `.css` dosyaları yazmak yerine, stil sınıfları doğrudan JSX elemanlarının `className` prop'u içine yazılır.

**Örnek:**
```jsx
// Geleneksel CSS yerine:
// <button class="primary-button">Gönder</button>

// Tailwind CSS ile:
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Gönder
</button>
```
Bu yaklaşım, stil ve bileşen mantığını bir arada tutarak geliştirmeyi hızlandırır. Projeye yeni bir stil eklemeniz gerektiğinde, genellikle yeni bir CSS sınıfı yazmak yerine mevcut Tailwind sınıflarını birleştirmeniz yeterlidir.

Tailwind yapılandırma dosyası (`tailwind.config.js`), projeye özel renkleri, fontları ve diğer tasarım token'larını tanımlar.

---

### State Yönetimi

Uygulama genelinde state yönetimi için **React Context API** ve **özel hook'lar** (`custom hooks`) kullanılmaktadır. Harici bir state yönetimi kütüphanesine (Redux, MobX vb.) şimdilik ihtiyaç duyulmamıştır.

*   **Yerel State (`useState`, `useReducer`):** Sadece tek bir bileşeni ilgilendiren state'ler için standart React hook'ları kullanılır.
*   **Global State (`useContext`):** Kimlik doğrulama durumu (`AuthContext`) veya kullanıcı tercihleri gibi birden çok bileşenin erişmesi gereken state'ler için Context API kullanılır.
    *   **Prensip:** Bir state'i "prop drilling" (prop'ları birden çok katman aşağıya iletme) yapmaya başladığınızı fark ederseniz, bu state'i bir Context'e taşımayı düşünün.

---

### Yeni Bir Bileşen Oluşturma

1.  Bileşenin yeniden kullanılabilir olup olmayacağına karar verin.
    *   **Evet ise:** `src/components` içine `YeniBilesen.jsx` adında bir dosya oluşturun.
    *   **Hayır ise (sayfaya özgü ise):** İlgili sayfa bileşeninin (`src/pages/Sayfa.jsx`) içine veya sayfanın kendi alt klasörüne (`src/pages/Sayfa/components/`) ekleyin.
2.  Bileşen adlandırması için `PascalCase` kullanın.
3.  Fonksiyonel bir bileşen oluşturun ve `export default` ile dışa aktarın.
4.  Stil için Tailwind CSS sınıflarını kullanın.
5.  Gerekli `prop`'lar için `PropTypes` veya TypeScript arayüzleri ekleyerek bileşenin arayüzünü belgeleyin (projenin mevcut standardına göre).

---

### Genel Kurallar ve En İyi Pratikler

*   **Mutlak İçe Aktarma Yolları (`Absolute Imports`):** `../` gibi göreceli yollar yerine `@/components/Button` gibi mutlak yollar kullanın. Bu, Vite yapılandırmasında (`vite.config.js`) tanımlanmıştır.
*   **Kod Formatlama:** Projede `Prettier` ve `ESLint` standartları zorunlu tutulmaktadır. Kodunuzu commit'lemeden önce formatladığınızdan emin olun.
*   **İsimlendirme:** Dosya adları ve bileşen adları açıklayıcı ve tutarlı olmalıdır. Hook'lar `use` ön ekiyle başlamalıdır.
# ESLint Sorunlarını Çözme Planı (Fazlara Ayrılmış)

Bu plan, `REFACTOR_PLAN.md`'deki faz yapısını takip eder ve her fazda yer alan dosyalardaki spesifik ESLint sorunlarını listeler. Amaç, kod kalitesini sistematik olarak artırmak ve tüm projenin ESLint kurallarına uymasını sağlamaktır.

---

### **FAZ 0: Global Otomatik Düzeltme**

**Odak:** `eslint --fix` komutu ile otomatik olarak düzeltilebilecek tüm sorunları proje genelinde çözmek.
**Hedef:** Düşük eforlu, yaygın sorunları temizleyerek manuel düzeltme gerektiren daha karmaşık sorunlara odaklanmak.
**Adımlar:**

1.  Proje kök dizininde `npm run lint -- --fix` komutunu çalıştır.
2.  Değişiklikleri kontrol et ve ardından bu plandaki kalan manuel adımlara geç.

---

### **FAZ 1: Migration Script'leri**

**Odak:** Veritabanı taşıma script'lerindeki ESLint sorunlarını gidermek.

- **Dosyalar ve Sorunlar:**
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\tests\migration-test.js`:
    - `no-unused-vars`: `'axios'` ve `'path'` değişkenleri tanımlanmış ama kullanılmıyor. (Satır 3, 4)
    - `no-undef`: `'describe'`, `'it'`, `'expect'` gibi global test fonksiyonları tanımlı değil. (Test dosyasının `env` ayarlarında `jest` veya `mocha` eksik olabilir)

---

### **FAZ 2: Backend - Çekirdek Kütüphaneler (Core Libs)**

**Odak:** Backend'in temel kütüphanelerindeki kural ihlallerini düzeltmek.

- **Dosyalar ve Sorunlar:**
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\backend\src\lib\cloudflareR2.js`:
    - `no-unused-vars`: `'DeleteObjectCommand'` import edilmiş ama kullanılmıyor. (Satır 6)
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\backend\src\lib\validation.js`:
    - `no-unused-vars`: `'zod'` import edilmiş ama kullanılmıyor. (Satır 1)

---

### **FAZ 3: Backend - Ana Giriş ve Middleware'ler**

**Odak:** Sunucu başlangıç dosyası ve middleware'lerdeki ESLint sorunlarını çözmek.

- **Dosyalar ve Sorunlar:**
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\backend\src\index.js`:
    - `no-unused-vars`: `'path'` import edilmiş ama kullanılmıyor. (Satır 11)
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\backend\src\middleware\jwtAuth.js`:
    - `no-unused-vars`: `'prisma'` import edilmiş ama kullanılmıyor. (Satır 2)

---

### **FAZ 7: Frontend - Ana Yapı ve Context'ler**

**Odak:** Uygulamanın ana yapısını oluşturan component ve context'lerdeki sorunları gidermek.

- **Dosyalar ve Sorunlar:**
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\App.jsx`:
    - `react/prop-types`: `App` component'i `user` prop'u için tip tanımına sahip değil.
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\contexts\AuthContext.jsx`:
    - `react-hooks/exhaustive-deps`: `useEffect` hook'u `location` bağımlılığını eksik içeriyor. (Satır 36)
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\components\Header.jsx`:
    - `react/prop-types`: `user` ve `onLogout` propları için tip tanımı eksik.

---

### **FAZ 8: Frontend - "Oyun Ekleme" Modalı**

**Odak:** "AddGameModal" ve alt component'lerindeki ESLint sorunlarını çözmek.

- **Dosyalar ve Sorunlar:**
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\components\AddGameModal.jsx`:
    - `react/prop-types`: `isOpen`, `onClose`, `onGameAdded` propları için tip tanımı eksik.
    - `react-hooks/exhaustive-deps`: `useEffect` hook'u `onGameAdded` bağımlılığını eksik içeriyor. (Satır 111)
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\components\AddGameModal\GameSearch.jsx`:
    - `react/prop-types`: `onGameSelect` prop'u için tip tanımı eksik.
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\components\AddGameModal\GameDetails.jsx`:
    - `react/prop-types`: `game` prop'u için tip tanımı eksik.
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\components\AddGameModal\GameForm.jsx`:
    - `react/prop-types`: `game` ve `onFormSubmit` propları için tip tanımı eksik.

---

### **FAZ 9: Frontend - "Ayarlar" Sayfası**

**Odak:** Ayarlar sayfası ve ilgili component'lerdeki kural ihlallerini düzeltmek.

- **Dosyalar ve Sorunlar:**
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\pages\SettingsPage.jsx`:
    - `no-unused-vars`: `'useAuth'` import edilmiş ama kullanılmıyor. (Satır 10)
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\components\Settings\ProfileSettings.jsx`:
    - `no-unused-vars`: `'useAuth'` import edilmiş ama kullanılmıyor. (Satır 3)
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\components\Settings\UserModal.jsx`:
    - `react/prop-types`: `isOpen`, `onClose`, `user`, `onUserUpdate` propları için tip tanımı eksik.
    - `react-hooks/exhaustive-deps`: `useEffect` hook'u `user` bağımlılığını eksik içeriyor. (Satır 16)

---

### **FAZ 10: Frontend - "Tutorial" Özelliği**

**Odak:** Tutorial özelliğini oluşturan dosyalardaki ESLint sorunlarını gidermek.

- **Dosyalar ve Sorunlar:**
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\hooks\useTutorial.js`:
    - `react-hooks/exhaustive-deps`: `useEffect` hook'u `active` ve `steps` bağımlılıklarını eksik içeriyor. (Satır 100)
  - `C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\src\components\Tutorial\TutorialOverlay.jsx`:
    - `react/prop-types`: `onNext`, `onPrev`, `onStop`, `step`, `isFirst`, `isLast` propları için tip tanımı eksik.

---

### **FAZ 11, 12, 13, 14: Diğer Modüller**

Yukarıdaki fazlarda listelenmeyen diğer dosyalarda önemli bir ESLint hatası tespit edilmemiştir. `eslint-report.json` dosyası incelendiğinde, hataların büyük bir kısmının `no-unused-vars` (kullanılmayan değişkenler), `react/prop-types` (eksik prop tipleri) ve `react-hooks/exhaustive-deps` (eksik useEffect bağımlılıkları) kurallarından kaynaklandığı görülmektedir.

**Genel Strateji:**

1.  Her fazın başında ilgili dosyalara odaklanarak `npm run lint -- --fix` komutunu tekrar çalıştır.
2.  **Prop Types:** Tüm component'lerde eksik olan `prop-types` tanımlamalarını ekle.
3.  **Unused Vars:** Kullanılmayan import'ları ve değişkenleri temizle.
4.  **Exhaustive Deps:** `useEffect`, `useCallback` gibi hook'ların bağımlılık dizilerini ESLint'in önerdiği şekilde düzelt. Bu, genellikle en çok dikkat gerektiren kısımdır çünkü uygulamanın mantığını etkileyebilir.

---

### **FAZ 15: Son Kontrol**

**Odak:** Tüm düzeltmelerden sonra projenin tamamen "lint-temiz" olduğunu doğrulamak.
**Adım:**

1.  Proje kök dizininde `npm run lint` komutunu çalıştır ve hiçbir hata veya uyarı (`warning`) çıktısı olmadığından emin ol.

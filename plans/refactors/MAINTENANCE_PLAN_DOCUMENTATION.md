# Bakım Planı: Dokümantasyon Güncellemesi

**Ana Hedef:** Projenin tüm dokümantasyonunu (hem kullanıcı hem de geliştirici için) kodun mevcut durumuyla senkronize hale getirmek, eksik bilgileri tamamlamak ve okunabilirliği artırmak.

---

### BÖLÜM 1: GENEL PROJE DOKÜMANLARI

#### Faz A: Ana `README.md` Dosyasını Güncelleme
1.  **Analiz Et:** Projenin kök dizinindeki `README.md` dosyasını aç.
2.  **Doğrula ve Güncelle:**
    *   **Proje Açıklaması:** Projenin amacını ve ana özelliklerini anlatan bölümün güncel olup olmadığını kontrol et.
    *   **Kurulum (Installation):** `npm install` veya `yarn install` gibi komutların doğruluğunu kontrol et. Gerekli Node.js versiyonu gibi önkoşulları ekle.
    *   **Çalıştırma (Running the App):** `npm run dev`, `npm run build`, `npm start` gibi komutların ve ne işe yaradıklarının doğru açıklandığından emin ol.
    *   **Teknoloji Yığını (Tech Stack):** Listelenen teknolojilerin (React, Vite, Node.js, Prisma, Tailwind CSS vb.) güncel ve doğru olduğunu kontrol et.

#### Faz B: `CONTRIBUTING.md` Dosyasını Oluşturma/Güncelleme
1.  **Analiz Et:** Projede `CONTRIBUTING.md` dosyası olup olmadığını kontrol et. Yoksa oluştur.
2.  **İçerik Ekle/Güncelle:**
    *   **Branch Stratejisi:** `feature/`, `bugfix/`, `chore/` gibi branch isimlendirme kurallarını tanımla.
    *   **Commit Mesajı Standardı:** "Conventional Commits" standardının (`feat:`, `fix:`, `docs:`) kullanılmasını öneren bir bölüm ekle.
    *   **Pull Request (PR) Süreci:** PR açmadan önce yapılması gerekenleri (lint, test çalıştırma vb.) ve PR şablonunu tanımla.
    *   **Kodlama Standartları:** `GEMINI.md`'deki ana kodlama standartlarına bir link ver.

---

### BÖLÜM 2: GELİŞTİRİCİ DOKÜMANTASYONU

#### Faz C: Mimari Dokümanını (`ARCHITECTURE.md`) Güncelleme
1.  **Analiz Et:** `docs/ARCHITECTURE.md` dosyasını aç.
2.  **Backend Mimarisi:**
    *   `users.js` refactor'ı sonrası ortaya çıkan **Controller -> Service -> Repository (Prisma)** katmanlı mimariyi açıklayan bir bölüm ekle.
    *   Bu akışı gösteren bir **Mermaid.js** sekans veya akış diyagramı oluştur ve dosyaya ekle.
3.  **Frontend Mimarisi:**
    *   `SettingsPage.jsx` refactor'ı sonrası ortaya çıkan **Sayfa -> Bölüm Bileşeni -> UI Bileşeni** ve **Hook** kullanımını açıklayan bir bölüm ekle.
    *   Veri akışını (`React Query`/`Zustand` -> `Hook` -> `Bileşen`) gösteren bir diyagram ekle.

#### Faz D: Veritabanı ve ERS Dokümanlarını Senkronize Etme
1.  **`DATABASE.md`:** `docs/DATABASE.md` dosyasını aç. `prisma/schema.prisma` dosyasındaki son şemayı yansıtacak şekilde modelleri ve ilişkileri güncelle. Gerekirse, `prisma-docs-generator` gibi bir araç kullanmayı değerlendir.
2.  **`ERS-REGISTRY.md`:** `docs/ERS-REGISTRY.md` dosyasını aç. Refactor'lar sırasında eklenen veya değiştirilen tüm bileşenler için ERS kodlarının doğru ve güncel olduğunu kontrol et. Eksik olanları ekle.

---

### BÖLÜM 3: OTOMATİK DOKÜMANTASYON VE KULLANICI REHBERİ

#### Faz E: JSDoc Yorumlarını Tamamlama
1.  **Hedef:** Projedeki tüm public fonksiyonlar, custom hook'lar ve React bileşenlerinin en üstüne JSDoc formatında açıklama blokları eklemek.
2.  **Uygulama (Tekrarlı Süreç):**
    *   `src/hooks`, `src/components`, `src/services` ve `backend/src/services` klasörlerindeki her bir dosyayı aç.
    *   Her fonksiyon/bileşen için:
        *   Ne işe yaradığını (`@description`)
        *   Aldığı parametreleri (`@param {type} name - açıklama`)
        *   Ne döndürdüğünü (`@returns {type} açıklama`) belirten JSDoc yorumlarını ekle.

#### Faz F: Kullanıcı Rehberini (`USER-GUIDE.md`) Gözden Geçirme
1.  **Analiz Et:** `docs/user-guide/` klasöründeki dosyaları aç.
2.  **Güncelle:** Refactor'lar veya özellik değişiklikleri sonucu kullanıcı arayüzünde meydana gelen değişiklikleri yansıtacak şekilde ekran görüntülerini ve açıklamaları güncelle. Özellikle Ayarlar sayfasındaki yeni düzeni anlatan bir bölüm ekle.

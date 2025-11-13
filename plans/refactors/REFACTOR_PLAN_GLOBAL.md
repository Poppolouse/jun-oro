# Global Refactor Planı (SettingsPage Dışı)

Bu plan, `SettingsPage.jsx` dışındaki yüksek öncelikli mimari sorunları çözmek için oluşturulmuştur. Her bölüm, projenin farklı bir alanındaki temel bir sorunu ele alır.

---

## BÖLÜM 1: BACKEND MİMARİSİ - `users.js` Refactor

**Ana Hedef:** `backend/src/routes/users.js` dosyasındaki iş mantığını (business logic) ve veritabanı erişimini, yeni oluşturulacak **Controller** ve **Service** katmanlarına taşımak. Bu, backend kodunu daha modüler, test edilebilir ve yönetilebilir hale getirecektir.

#### Faz A: Controller ve Service Katmanlarını Oluşturma (İlk Adım)
1.  **Dizin Oluştur:** `backend/src` altında `controllers` ve `services` adında iki yeni klasör oluştur.
2.  **Dosya Oluştur:** `controllers` içine `userController.js`, `services` içine `userService.js` adında iki yeni dosya oluştur.
3.  **İlk Taşıma (Basit Bir Route):** `users.js` içinden basit bir route seç (örn: `router.get('/profile', ...)`).
    *   Bu route'un içindeki tüm mantığı `userController.js` içine `getProfile(req, res, next)` adında bir `async` fonksiyona taşı.
    *   `userController.js` içindeki bu fonksiyonda bulunan veritabanı sorgusunu (örn: `prisma.user.findUnique(...)`) ve ilgili iş mantığını `userService.js` içine `findUserProfile(userId)` adında bir fonksiyona taşı.
4.  **Katmanları Bağla:**
    *   `userController.js`'deki `getProfile` fonksiyonu artık `userService.findUserProfile`'ı çağırmalı ve dönen sonuca göre `res.json()` veya `next(error)` ile yanıt vermelidir.
    *   `users.js`'deki `router.get('/profile', ...)` satırı, artık sadece `userController.getProfile` fonksiyonunu çağıracak şekilde güncellenmelidir: `router.get('/profile', auth, userController.getProfile);`

#### Faz B: Kimlik Doğrulama (Authentication) Mantığını Taşıma
1.  **Analiz Et:** `users.js` içindeki `login`, `register`, `logout` gibi route'ların mantığını analiz et.
2.  **Controller'a Taşı:** Bu route'ların mantığını `userController.js` içine `login(req, res, next)`, `register(req, res, next)` gibi fonksiyonlara taşı.
3.  **Service'e Taşı:** Parola hash'leme/karşılaştırma, token oluşturma, kullanıcıyı veritabanında bulma/oluşturma gibi iş mantıklarını `userService.js` içine `authenticateUser(...)`, `createUser(...)` gibi fonksiyonlara taşı.
4.  **Router'ı Güncelle:** `users.js` içindeki ilgili route'ları, yeni controller fonksiyonlarını çağıracak şekilde güncelle.

#### Faz C: Admin İşlemlerini Taşıma
1.  **Analiz Et:** `users.js` içindeki `admin` yetkisi gerektiren tüm route'ları (kullanıcı listeleme, silme, rol değiştirme vb.) analiz et.
2.  **Controller'a Taşı:** Bu route'ların mantığını `userController.js` içine `adminGetAllUsers`, `adminDeleteUser` gibi fonksiyonlara taşı.
3.  **Service'e Taşı:** İlgili veritabanı işlemlerini `userService.js` içine `listAllUsers`, `deleteUserById` gibi fonksiyonlara taşı.
4.  **Router'ı Güncelle:** `users.js` içindeki ilgili route'ları, yeni controller fonksiyonlarını çağıracak şekilde güncelle.

#### Faz D: Son Temizlik
1.  **Doğrula:** `users.js` dosyasında hiçbir iş mantığı kalmadığını, dosyanın sadece `router.get(...)`, `router.post(...)` gibi yönlendirme tanımlarından oluştuğunu kontrol et.
2.  **Temizle:** Artık kullanılmayan `require` veya değişkenleri dosyadan sil.

---

## BÖLÜM 2: FRONTEND HOOK MİMARİSİ - `useSettingsData.js` Refactor

**Ana Hedef:** `src/hooks/useSettingsData.js` "God Hook"unu, her biri tek bir sorumluluğa sahip daha küçük ve özel hook'lara bölmek. Bu, `SettingsPage` refactor'ı ile paralel olarak yapılmalıdır.

#### Faz A: `useAdminUsers` Hook'unu Ayırma
1.  **Dosya Oluştur:** `src/hooks` altında `useAdminUsers.js` adında yeni bir dosya oluştur.
2.  **Mantığı Taşı:** `useSettingsData.js` içinden kullanıcı yönetimiyle ilgili her şeyi (örn: `users`, `pendingUsers` state'leri; `loadUsers`, `saveUser` fonksiyonları) `useAdminUsers.js` içine taşı.
3.  **Yeni Hook'u Kullan:** `SettingsPage.jsx` veya ilgili alt bileşen (`AdminUsersSection` vb.) artık `useSettingsData` yerine `useAdminUsers` hook'unu kullanmalıdır.

#### Faz B: `useChangelogs` Hook'unu Ayırma
1.  **Dosya Oluştur:** `src/hooks` altında `useChangelogs.js` adında yeni bir dosya oluştur.
2.  **Mantığı Taşı:** `useSettingsData.js` içinden `changelogs` state'i ve `loadChangelogs`, `saveChangelog` gibi fonksiyonları `useChangelogs.js` içine taşı.
3.  **Yeni Hook'u Kullan:** İlgili bileşen (`ChangelogSection.jsx`) artık `useChangelogs` hook'unu kullanmalıdır.

#### Faz C: Diğer Hook'ları Ayırma (Tekrarlı Süreç)
1.  **Tekrarla:** Yukarıdaki süreci, `useSettingsData` içinde kalan diğer her bir mantıksal bölüm için tekrarla. Her biri için ayrı bir faz olarak düşün:
    *   `useApiKeys.js`
    *   `useAuditLogs.js`
    *   `useR2Stats.js`
    *   `useNotificationTracking.js`

#### Faz D: `useSettingsData` Hook'unu Temizleme
1.  **Görev:** Tüm mantık dışarı taşındıktan sonra, `useSettingsData.js` dosyasının içini boşalt ve projeden sil. Eğer hala tüm ayarlar sayfasını ilgilendiren genel bir state varsa, sadece o kalacak şekilde küçült.

---

## BÖLÜM 3: TASARIM SİSTEMİ TUTARLILIĞI

**Ana Hedef:** Proje genelinde bileşen kullanımı ve stil (renk, boşluk vb.) konusunda tutarlılığı sağlamak.

#### Faz A: `ApiKeysSection.jsx` Stil Düzeltmesi
1.  **Görev:** `src/components/Settings/ApiKeysSection.jsx` dosyasını aç.
2.  **Düzelt:** Dosyadaki açık tema renklerini (`bg-[#EEEAE4]`) ve standart dışı gölge/stil kullanımlarını, `GEMINI.md`'de tanımlanan **Dark Theme** paletine ve standartlarına göre güncelle.

#### Faz B: Proje Geneli Stil Denetimi ve Düzeltme
1.  **Denetle:** Proje genelinde `grep` veya benzeri bir arama aracıyla standart dışı renk (`bg-[#...`, `text-[#...`) veya stil (`className="..."` ile özel buton oluşturma) kullanımlarını ara.
2.  **Listele:** Standartlara uymayan bileşenlerin bir listesini çıkar.
3.  **Düzelt (Tekrarlı Süreç):** Listelenen her bir bileşeni, standartlara uyacak şekilde tek tek düzelt. Her bir düzeltme ayrı bir commit olarak düşünülmelidir.

# Bakım Planı: Kapsamlı Test Yazımı

**Ana Hedef:** Projenin kritik parçaları için birim (unit) ve entegrasyon (integration) testleri yazarak kodun güvenilirliğini, kararlılığını ve gelecekteki değişikliklere karşı direncini artırmak. Testler, `vitest` ve `React Testing Library` kullanılarak yazılacaktır.

---

### BÖLÜM 1: HAZIRLIK VE ATOMİK BİLEŞENLER

#### Faz A: Test Ortamı Kurulumu ve Yapılandırması
1.  **Kontrol Et:** `vitest.config.js` ve `tests/setup.js` dosyalarının mevcut ve doğru yapılandırıldığından emin ol.
2.  **Yapılandır:** `vitest.config.js` içinde `coverage` raporlamasının etkinleştirildiğinden ve `%85` gibi bir genel kapsama hedefi belirlendiğinden emin ol. Mocking (taklit) için gerekli kütüphanelerin (`msw`, `jest-mock` vb.) kurulu ve ayarlı olduğunu kontrol et.

#### Faz B: Atomik UI Bileşenlerini Test Etme
1.  **Hedef:** `src/components/ui` klasöründeki tüm bileşenler için test yazmak.
2.  **Faz B1 - Button.test.jsx:**
    *   `Button` bileşeninin `variant`, `size`, `disabled`, `loading` gibi tüm prop'ları aldığında doğru şekilde render edildiğini test et.
    *   `onClick` olayının doğru şekilde tetiklendiğini, `disabled` veya `loading` durumlarında tetiklenmediğini test et.
3.  **Faz B2 - InputField.test.jsx:**
    *   `label`, `placeholder`, `value`, `error` prop'larının doğru şekilde gösterildiğini test et.
    *   `onChange` olayının kullanıcı yazarken tetiklendiğini test et.
4.  **Faz B3 - Diğer UI Bileşenleri:**
    *   `ToggleSwitch`, `Card`, `Spinner` gibi diğer tüm `ui` bileşenleri için benzer şekilde prop'ları ve temel etkileşimleri test eden dosyalar oluştur.

---

### BÖLÜM 2: HOOK'LAR VE İŞ MANTIĞI

#### Faz C: Custom Hook'ları Test Etme
1.  **Hedef:** `src/hooks` klasöründeki, özellikle iş mantığı içeren hook'ları test etmek.
2.  **Faz C1 - `useProfileSettingsForm.js` Testi:**
    *   `@testing-library/react-hooks`'un `renderHook` fonksiyonunu kullanarak hook'u render et.
    *   Başlangıç değerlerinin doğru set edildiğini test et.
    *   `handleChange` ile değerler değiştiğinde state'in güncellendiğini test et.
    *   Geçersiz input verildiğinde `errors` nesnesinin doğru şekilde dolduğunu test et.
    *   `submit` fonksiyonu çağrıldığında `onSave` callback'inin doğru parametrelerle çağrıldığını test et.
3.  **Faz C2 - `useUpdatePassword.js` Testi:**
    *   Şifrelerin eşleşmemesi durumunda `errors` nesnesinin doğru hatayı verdiğini test et.
    *   Başarılı `submit` denemesinde `onUpdatePassword` callback'inin çağrıldığını test et.
4.  **Faz C3 - Veri Hook'ları (Örn: `useAdminUsers.js`):**
    *   API isteklerini `msw` (Mock Service Worker) gibi bir araçla mock'la (taklit et).
    *   Hook ilk render edildiğinde verilerin doğru şekilde çekildiğini ve state'in güncellendiğini test et.
    *   API'den hata döndüğünde `error` state'inin doğru şekilde set edildiğini test et.

---

### BÖLÜM 3: ENTEGRASYON VE E2E TESTLERİ

#### Faz D: Bölüm (Section) Entegrasyon Testleri
1.  **Hedef:** Birden fazla birim (bileşen, hook) bir araya geldiğinde doğru çalışıp çalışmadığını test etmek.
2.  **Faz D1 - `ProfileSettings.jsx` Entegrasyon Testi:**
    *   Bileşeni `React Testing Library`'nin `render` fonksiyonu ile render et.
    *   Kullanıcının input'ları doldurmasını simüle et (`userEvent.type`).
    *   "Kaydet" butonuna tıklanmasını simüle et (`userEvent.click`).
    *   Başarılı kaydetme sonrası başarı mesajının ekranda göründüğünü doğrula.
3.  **Faz D2 - `SecuritySettings.jsx` Entegrasyon Testi:**
    *   Şifrelerin uyuşmadığı bir senaryoyu test et ve hata mesajının göründüğünü doğrula.
    *   Başarılı güncelleme senaryosunu test et.

#### Faz E: Uçtan Uca (E2E) Test Senaryoları
1.  **Hedef:** Kullanıcının gerçek bir tarayıcıda yapacağı kritik akışları simüle etmek. (Playwright veya Cypress kullanılabilir).
2.  **Faz E1 - Kullanıcı Giriş Akışı:**
    *   Giriş sayfasını ziyaret et.
    *   Kullanıcı adı ve şifre alanlarını doldur.
    *   "Giriş Yap" butonuna tıkla.
    *   Ana sayfaya veya dashboard'a yönlendirildiğini doğrula.
3.  **Faz E2 - Profil Güncelleme Akışı:**
    *   Giriş yap (önceki adımdan faydalan).
    *   Ayarlar sayfasına git.
    *   Profil sekmesine tıkla.
    *   "İsim" alanını yeni bir değerle güncelle.
    *   "Kaydet" butonuna tıkla.
    *   Sayfayı yeniledikten sonra yeni ismin hala input alanında göründüğünü doğrula.

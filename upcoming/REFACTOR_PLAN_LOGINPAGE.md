# LoginPage.jsx - Atomik Sisteme Geçiş Planı

**Ana Hedef:** `LoginPage.jsx` dosyasını, yeniden kullanılabilir alt bileşenlere ve hook'lara ayırarak daha temiz, yönetilebilir ve standartlara uygun bir yapıya kavuşturmak.

---

### Faz A: Form Mantığını Hook'lara Taşıma
- **Sorun:** Giriş ve kayıt formlarının state yönetimi, validasyon ve `submit` işlemleri doğrudan `LoginPage` bileşeni içinde yapılıyor.
- **Görev 1 (`useLoginForm.js`):**
    - `src/hooks/` altında `useLoginForm.js` adında yeni bir custom hook oluştur.
    - `LoginPage` içindeki `formData`, `error`, `isLoading` state'lerini ve `handleLogin` fonksiyonunu bu hook'a taşı.
    - Hook, `formState`, `error`, `isLoading`, `handleInputChange` ve `handleSubmit` gibi değerleri ve fonksiyonları döndürmeli.
- **Görev 2 (`useRegisterForm.js`):**
    - `src/hooks/` altında `useRegisterForm.js` adında yeni bir custom hook oluştur.
    - `LoginPage` içindeki `registerData` state'ini, ilgili validasyonları (`password !== confirmPassword` vb.) ve `handleRegister` fonksiyonunu bu hook'a taşı.
    - Bu hook da benzer şekilde form yönetimi için gerekli state ve fonksiyonları dışarıya döndürmeli.

### Faz B: Formları Ayrı Bileşenlere Ayırma
- **Sorun:** Hem giriş hem de kayıt formunun JSX'i, `LoginPage` içinde `renderLoginForm` ve `renderRegisterForm` adında iki ayrı fonksiyonla render ediliyor. Bu, ana bileşeni şişiriyor.
- **Görev 1 (`LoginForm.jsx`):**
    - `src/components/Auth/` altında `LoginForm.jsx` adında yeni bir bileşen oluştur.
    - `renderLoginForm` fonksiyonunun içindeki tüm JSX'i bu yeni bileşene taşı.
    - `LoginForm.jsx`, Faz A'da oluşturulan `useLoginForm` hook'unu kullanarak kendi mantığını yönetmeli.
- **Görev 2 (`RegisterForm.jsx`):**
    - `src/components/Auth/` altında `RegisterForm.jsx` adında yeni bir bileşen oluştur.
    - `renderRegisterForm` fonksiyonunun içindeki tüm JSX'i bu yeni bileşene taşı.
    - `RegisterForm.jsx`, Faz A'da oluşturulan `useRegisterForm` hook'unu kullanarak kendi mantığını yönetmeli.
- **Görev 3 (`LoginPage.jsx`'i Temizleme):**
    - `LoginPage.jsx` artık sadece `showRegister` state'ini tutmalı ve bu state'e göre `<LoginForm />` veya `<RegisterForm />` bileşenlerinden birini render etmelidir. Form geçişlerini sağlayan (`Hesabın yok mu?` gibi) butonlar, bu bileşenlere prop olarak fonksiyon geçerek yönetilebilir.

### Faz C: Ham HTML Elementlerini Standart UI Bileşenleriyle Değiştirme
- **Sorun:** Formlarda standart `ui` kitimiz yerine, özel `className`'ler ile stil verilmiş `<input>` ve `<button>` elementleri kullanılıyor.
- **Görev 1 (`InputField` Kullanımı):** `LoginForm.jsx` ve `RegisterForm.jsx` içindeki tüm `<input>` elementlerini, standart `<InputField>` bileşeniyle değiştir. `label`, `placeholder`, `value`, `onChange`, `error` gibi propları doğru şekilde bağla.
- **Görev 2 (`Button` Kullanımı):**
    - "Giriş Yap" ve "Kayıt Ol" ana butonlarını, `<Button type="submit" loading={isLoading} variant="primary" fullWidth>` gibi standart `<Button>` bileşeniyle değiştir.
    - "Hesabın yok mu?" ve "Zaten hesabın var mı?" gibi link butonlarını, `<Button variant="ghost" onClick={...}>` bileşeniyle değiştir.
- **Görev 3 (Hata Mesajı):** Hata mesajlarını gösteren `div`'i, standart bir `<Alert variant="danger">` bileşeniyle (eğer yoksa oluşturulmalı) değiştir.

### Faz D: Stil ve ERS Kodu Uyumluluğu
- **Görev 1 (Stil):** Yeni oluşturulan `LoginForm` ve `RegisterForm` bileşenlerindeki tüm renk, boşluk ve köşe yuvarlaklığı gibi stillerin, `GEMINI.md`'deki "Dark Theme" paletiyle tam uyumlu olduğundan emin ol.
- **Görev 2 (ERS):** `LoginPage.jsx`'teki `data-registry` attribute'unu `data-ers` olarak düzelt. Ayrıca, `LoginForm` ve `RegisterForm` içindeki tüm interaktif elementlere (inputlar, butonlar) hiyerarşik olarak doğru `data-ers` kodlarını ekle.

# Proje Mimarisi

Bu doküman, Jun-Oro platformunun teknik mimarisini, temel bileşenlerini ve bu bileşenlerin birbiriyle nasıl etkileşimde bulunduğunu açıklar. Amacımız, geliştiricilere projenin yapısı hakkında net bir anlayış sunmaktır.

---

### Genel Felsefe

Jun-Oro, modern ve ölçeklenebilir bir web uygulaması olarak tasarlanmıştır. Temel mimari felsefesi, frontend (kullanıcı arayüzü) ve backend (sunucu tarafı mantık) katmanlarını net bir şekilde ayırmaya dayanır. Bu **başsız (headless)** yaklaşım, her iki katmanın da bağımsız olarak geliştirilmesine ve ölçeklendirilmesine olanak tanır.

---

### Ana Bileşenler

Platform üç ana katmandan oluşur:

1.  **Frontend (React):** Kullanıcının tarayıcısında çalışan ve kullanıcı deneyimini sunan tek sayfa uygulaması (SPA).
2.  **Backend (Node.js/Express):** İş mantığını yürüten, veritabanıyla iletişim kuran ve harici servislerle entegre olan API sunucusu.
3.  **Veri Katmanı (PostgreSQL & Prisma):** Tüm uygulama verilerini depolayan ve yöneten katman.

Aşağıdaki şema, bu bileşenlerin genel etkileşimini göstermektedir:

```
┌──────────────────────────────────────────────────┐
│                   Kullanıcı (Tarayıcı)           │
└───────────────────────▲──────────────────────────┘
                        │ (HTTPS)
┌───────────────────────▼──────────────────────────┐
│             Frontend (React, Vite)               │
│  - Kullanıcı Arayüzü                             │
│  - State Yönetimi (Context API)                  │
│  - API İstekleri                                 │
└───────────────────────▲──────────────────────────┘
                        │ (REST API Çağrıları)
┌───────────────────────▼──────────────────────────┐
│             Backend (Node.js, Express)           │
│  - Kimlik Doğrulama (JWT)                        │
│  - İş Mantığı (Servisler)                        │
│  - Veri Doğrulama (Zod)                          │
└───────────────────────▲──────────────────────────┘
                        │ (SQL Sorguları - Prisma)
┌───────────────────────▼──────────────────────────┐
│             Veri Katmanı (PostgreSQL)            │
│  - Kullanıcılar, Oyunlar, Kütüphane Verileri     │
└──────────────────────────────────────────────────┘
```

---

### Frontend Mimarisi (`/src`)

Frontend, **React** ve **Vite** kullanılarak oluşturulmuş modern bir SPA'dır. Temel amaç, yeniden kullanılabilir ve yönetimi kolay bileşenler oluşturmaktır.

*   **`pages/`**: Her bir sayfanın ana bileşenini içerir (örn: `HomePage.jsx`, `ArkadeLibrary.jsx`). Bu bileşenler, daha küçük UI bileşenlerini bir araya getirir.
*   **`components/`**: Butonlar, formlar, oyun kartları gibi uygulama genelinde yeniden kullanılabilen daha küçük React bileşenlerini barındırır.
*   **`hooks/`**: `useAuth`, `useLibrary` gibi state yönetimi ve backend ile iletişim gibi karmaşık mantıkları soyutlayan özel hook'ları içerir. State yönetimi için harici bir kütüphane yerine **React Context API** tercih edilmiştir.
*   **`services/`**: Backend API'sine yapılan `fetch` veya `axios` isteklerini yöneten fonksiyonları barındırır.

**Veri Akışı (Frontend):**
Kullanıcı bir eylemde bulunduğunda (örneğin bir butona tıkladığında), olay genellikle şöyle bir akış izler:
1.  **Component:** Kullanıcı etkileşimini yakalar.
2.  **Custom Hook:** Gerekli state'i günceller ve ilgili API servisini çağırır.
3.  **API Service:** Backend'e bir HTTP isteği gönderir.
4.  **Response:** Backend'den gelen yanıt, hook tarafından işlenir ve state güncellenir.
5.  **UI Update:** State'teki değişiklik React tarafından algılanır ve arayüz otomatik olarak güncellenir.

---

### Backend Mimarisi (`/backend`)

Backend, **Node.js** ve **Express.js** üzerine kurulu, katmanlı bir mimariye sahiptir. Bu yapı, sorumlulukları ayırarak kodun daha organize ve test edilebilir olmasını sağlar.

*   **`routes/` (Yönlendirme Katmanı):** Gelen HTTP isteklerini karşılayan ve ilgili servis fonksiyonlarına yönlendiren katmandır. `/api/games`, `/api/users` gibi endpoint'leri tanımlar.
*   **`middleware/` (Ara Katman):** İstekler hedefine ulaşmadan önce kimlik doğrulama, veri doğrulama (Zod ile) veya hata yönetimi gibi ara işlemleri yürüten fonksiyonları içerir.
*   **`lib/` (Servis Katmanı):** Uygulamanın temel iş mantığının bulunduğu yerdir. Örneğin, `GameService` bir oyunun nasıl ekleneceğini veya güncelleneceğini tanımlar. Bu katman, veritabanı işlemlerini gerçekleştirmek için Prisma'yı kullanır.
*   **`prisma/` (Veri Erişim Katmanı):** Veritabanı şemasını (`schema.prisma`), migration dosyalarını ve Prisma Client yapılandırmasını içerir. Prisma, veritabanı ile güvenli ve kolay bir şekilde iletişim kurmamızı sağlayan bir ORM'dir.

---

### Harici API Entegrasyonları

Jun-Oro, oyun verilerini zenginleştirmek için bir dizi harici API'den yararlanır:

*   **IGDB API:** Oyun kapak resimleri, türleri, çıkış tarihleri gibi temel oyun verilerini almak için kullanılır.
*   **Steam API:** Kullanıcıların Steam kütüphanelerini içe aktarmalarını sağlamak için kullanılır.
*   **HowLongToBeat API:** Bir oyunun ortalama bitirme süresini almak için kullanılır.

Bu entegrasyonlar, backend'deki servis katmanı içinde yönetilir. Backend, bu harici API'lerden aldığı verileri işler ve kendi veritabanına kaydeder.
# Geliştirici Kurulum Kılavuzu

Bu kılavuz, Jun-Oro projesini yerel geliştirme ortamınızda kurmanız, çalıştırmanız ve projeye katkıda bulunmaya başlamanız için gereken tüm adımları detaylı bir şekilde açıklar.

---

### 1. Ön Gereksinimler

Geliştirmeye başlamadan önce sisteminizde aşağıdaki araçların kurulu olduğundan emin olun:

*   **Node.js:** `v18.0` veya üstü. (Versiyonu `node -v` komutuyla kontrol edebilirsiniz.)
*   **npm:** Node.js ile birlikte gelir. (`npm -v`)
*   **Git:** Versiyon kontrolü için. (`git --version`)
*   **PostgreSQL:** `v14.0` veya üstü bir veritabanı sunucusu.
*   **Bir Kod Editörü:** VS Code, WebStorm vb.

---

### 2. Projeyi Klonlama ve Bağımlılıkları Yükleme

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/Poppolouse/jun-oro.git
    cd jun-oro
    ```

2.  **Frontend Bağımlılıklarını Yükleyin:**
    Projenin ana dizinindeyken, frontend (React) uygulaması için gerekli olan `node_modules`'ı yükleyin.
    ```bash
    npm install
    ```

3.  **Backend Bağımlılıklarını Yükleyin:**
    Backend (Node.js/Express) projesinin bağımlılıklarını yüklemek için `backend` dizinine geçiş yapın.
    ```bash
    cd backend
    npm install
    cd ..
    ```

---

### 3. Ortam Değişkenlerini (`.env`) Yapılandırma

Projenin hem frontend hem de backend tarafı, düzgün çalışabilmek için ortam değişkenlerine ihtiyaç duyar. Bu değişkenler `.env` dosyalarında saklanır ve repoya dahil edilmez.

1.  **Frontend `.env` Dosyası:**
    *   Projenin ana dizininde, `.env.example` dosyasını kopyalayarak `.env` adında yeni bir dosya oluşturun.
    *   Dosyayı açın ve içindeki değişkenleri kendi yerel ortamınıza göre düzenleyin. `VITE_API_BASE_URL` değişkeninin, çalışan backend sunucunuzun adresini (genellikle `http://localhost:3000`) gösterdiğinden emin olun.

    ```bash
    # Proje ana dizinindeyken
    cp .env.example .env
    ```

2.  **Backend `.env` Dosyası:**
    *   `backend` dizini içinde, `backend/.env.example` dosyasını kopyalayarak `backend/.env` adında yeni bir dosya oluşturun.
    *   Bu dosya, veritabanı bağlantı bilgilerini ve harici API anahtarlarını içerir.

    ```bash
    # Proje ana dizinindeyken
    cp backend/.env.example backend/.env
    ```

    **Önemli `.env` Değişkenleri (Backend):**
    *   `DATABASE_URL`: PostgreSQL veritabanı bağlantı adresiniz. Formatı şu şekildedir: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`. Kendi PostgreSQL kullanıcı adı, şifre ve veritabanı adınızla güncellediğinizden emin olun.
    *   `JWT_SECRET`: JWT token'larını imzalamak için kullanılacak gizli bir anahtar. Buraya rastgele ve güvenli bir karakter dizisi girin.
    *   `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`: IGDB API'sini kullanmak için gerekli anahtarlar.
    *   `STEAM_API_KEY`: Steam API anahtarınız.

---

### 4. Veritabanı Kurulumu

Backend'in çalışması için veritabanı şemasının oluşturulması gerekir. Prisma, bu işlemi basitleştirir.

1.  **Veritabanı Oluşturun:**
    PostgreSQL'de, backend `.env` dosyanızda belirttiğiniz isimde bir veritabanı oluşturduğunuzdan emin olun.

2.  **Prisma Migration'larını Çalıştırın:**
    Bu komut, `prisma/migrations` klasöründeki dosyalara bakarak veritabanı şemanızı oluşturur veya günceller.
    ```bash
    # Proje ana dizinindeyken
    cd backend
    npm run db:migrate
    ```

3.  **Prisma Client'ı Oluşturun:**
    Bu komut, veritabanı şemanıza göre TypeScript tiplerini oluşturur, böylece kodunuzda tip güvenliği sağlanır.
    ```bash
    npm run db:generate
    cd ..
    ```

---

### 5. Uygulamayı Çalıştırma

Artık hem frontend'i hem de backend'i çalıştırmaya hazırsınız. İki ayrı terminal penceresi kullanmanız gerekecek.

**Terminal 1: Frontend'i Çalıştırma**
```bash
# Proje ana dizinindeyken
npm run dev
```
Bu komut, Vite geliştirme sunucusunu başlatır. Uygulama varsayılan olarak `http://localhost:5173` adresinde erişilebilir olacaktır.

**Terminal 2: Backend'i Çalıştırma**
```bash
# Proje ana dizinindeyken
cd backend
npm run dev
```
Bu komut, Nodemon ile backend geliştirme sunucusunu başlatır. API, varsayılan olarak `http://localhost:3000` adresinde erişilebilir olacaktır.

### Kurulum Başarılı!

Her şey yolunda gittiyse, artık tarayıcınızda `http://localhost:5173` adresine giderek uygulamayı görebilir ve geliştirmeye başlayabilirsiniz.

**Sık Karşılaşılan Sorunlar:**
*   **`npm install` hatası:** Node.js veya npm versiyonunuzun uyumlu olduğundan emin olun. Bazen `node_modules` ve `package-lock.json` dosyalarını silip `npm install` komutunu yeniden çalıştırmak sorunu çözebilir.
*   **Veritabanı bağlantı hatası:** `backend/.env` dosyasındaki `DATABASE_URL`'in doğru olduğundan emin olun. PostgreSQL sunucunuzun çalıştığını kontrol edin.
*   **API isteklerinde `404` veya `500` hatası:** Backend sunucunuzun çalıştığından ve `VITE_API_BASE_URL`'in doğru adresi gösterdiğinden emin olun.
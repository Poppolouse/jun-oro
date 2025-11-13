# Jun-Oro'ya Başlangıç Rehberi

🎮 **Jun-Oro'ya hoş geldiniz!** Bu rehber, platformu hızlıca kurmanıza ve kullanmaya başlamanıza yardımcı olacaktır.

## 📋 İçindekiler

1. [Sistem Gereksinimleri](#1-sistem-gereksinimleri)
2. [Kurulum Adımları](#2-kurulum-adımları)
3. [İlk Yapılandırma](#3-ilk-yapılandırma)
4. [Uygulamayı Çalıştırma](#4-uygulamayı-çalıştırma)
5. [Hızlı Başlangıç](#5-hızlı-başlangıç)
6. [Sorun Giderme](#6-sorun-giderme)

---

## 1. Sistem Gereksinimleri

### 🔧 Minimum Gereksinimler

- **İşletim Sistemi**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **Node.js**: 18.0 veya üzeri
- **PostgreSQL**: 14.0 veya üzeri
- **RAM**: Minimum 4GB (önerilen 8GB)
- **Depolama**: 2GB boş alan

### 🌐 Tarayıcı Desteği

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

---

## 2. Kurulum Adımları

### 📥 Adım 1: Projeyi Klonlama

```bash
# GitHub'dan projeyi klonlayın
git clone https://github.com/Poppolouse/jun-oro.git

# Proje dizinine gidin
cd jun-oro
```

### 📦 Adım 2: Frontend Kurulumu

```bash
# Ana dizinde bağımlılıkları yükleyin
npm install

# Environment dosyasını oluşturun
cp .env.example .env

# .env dosyasını düzenleyin (gerektiğinde)
```

### 🗄️ Adım 3: Backend Kurulumu

```bash
# Backend dizinine gidin
cd backend

# Backend bağımlılıklarını yükleyin
npm install

# Backend environment dosyasını oluşturun
cp .env.example .env

# Backend .env dosyasını düzenleyin
```

### 🗃️ Adım 4: Veritabanı Kurulumu

```bash
# Backend dizinindeyken
npm run db:migrate    # Veritabanı migrasyonlarını çalıştır
npm run db:generate  # Prisma client'ını oluştur
```

---

## 3. İlk Yapılandırma

### 🔑 Environment Değişkenleri

Frontend `.env` dosyası:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Jun-Oro
VITE_APP_VERSION=1.0.0
```

Backend `.env` dosyası:

```env
# Veritabanı
DATABASE_URL="postgresql://username:password@localhost:5432/junoro"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# API Keys (isteğe bağlı)
IGDB_API_KEY=your-igdb-api-key
STEAM_API_KEY=your-steam-api-key

# Cloudflare R2 (isteğe bağlı)
R2_ACCESS_KEY=your-r2-access-key
R2_SECRET_KEY=your-r2-secret-key
R2_BUCKET=your-bucket-name
R2_ENDPOINT=your-r2-endpoint
```

### 🗄️ Veritabanı Ayarları

PostgreSQL kurulumu için:

**Windows:**

```bash
# Chocolatey ile
choco install postgresql

# veya resmi sitesinden indirin
# https://www.postgresql.org/download/windows/
```

**macOS:**

```bash
# Homebrew ile
brew install postgresql
brew services start postgresql

# veya Postgres.app kullanın
# https://postgresapp.com/
```

**Linux (Ubuntu):**

```bash
# Apt ile
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 4. Uygulamayı Çalıştırma

### 🚀 Geliştirme Modu

Terminal 1 - Frontend:

```bash
# Ana dizinde
npm run dev
```

Terminal 2 - Backend:

```bash
# Backend dizininde
npm run dev
```

### 🌐 Erişim Adresleri

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Dokümantasyonu**: http://localhost:3000/api-docs
- **Veritabanı Yönetimi**: `npm run db:studio` komutundan sonra

---

## 5. Hızlı Başlangıç

### 🎯 İlk Adımlar

1. **Uygulamayı Açın**
   - Tarayıcınızda http://localhost:5173 adresini açın

2. **Hesap Oluşturun**
   - Sağ üst köşedeki "Kayıt Ol" butonuna tıklayın
   - E-posta, kullanıcı adı ve şifre bilgilerinizi girin
   - Kayıt formunu tamamlayın

3. **İlk Oyununuzu Ekleyin**
   - Ana sayfadaki "Oyun Ekle" butonuna tıklayın
   - Oyun adını arama kutusuna yazın
   - IGDB'den oyun bilgilerini çekin veya manuel olarak girin
   - "Kütüphaneye Ekle" butonuna tıklayın

4. **Oyun Oturumu Başlatın**
   - Kütüphanenizden bir oyun seçin
   - "Oyunu Başlat" butonuna tıklayın
   - Oyun bittiğinde "Oyunu Durdur" butonuna tıklayın

### 🎮 Temel Kullanım

| Özellik           | Nasıl Kullanılır?                          |
| ----------------- | ------------------------------------------ |
| **Oyun Arama**    | Üstteki arama çubuğunu kullanın            |
| **Filtreleme**    | Platform ve tür filtrelerini kullanın      |
| **Oyun Ekleme**   | "+" butonuna tıklayın                      |
| **Süre Takibi**   | Oyun kartlarındaki başlat/durdur butonları |
| **İstatistikler** | Sol menüden "İstatistikler" seçeneği       |
| **Ayarlar**       | Sağ üst köşedeki profil ikonu              |

---

## 6. Sorun Giderme

### 🔧 Yaygın Kurulum Sorunları

#### ❌ "npm install" Hatası

```bash
# Çözüm: Node.js sürümünü kontrol edin
node --version  # 18+ olmalı

# Eski sürüm varsa, güncelleyin:
# Windows: https://nodejs.org/
# macOS: brew install node
# Linux: sudo apt install nodejs npm
```

#### 🗄️ Veritabanı Bağlantı Hatası

```bash
# PostgreSQL'in çalıştığını kontrol edin
pg_isready

# Servisi başlatın (Linux/macOS)
sudo systemctl start postgresql
brew services start postgresql

# Windows'da Services'den PostgreSQL servisini başlatın
```

#### 🌐 Port Çakışması

```bash
# Portların kullanımını kontrol edin
netstat -an | grep :3000  # Backend portu
netstat -an | grep :5173  # Frontend portu

# Farklı port kullanın:
# Frontend: VITE_PORT=5174 npm run dev
# Backend: PORT=3001 npm run dev
```

### 🐛 Çalışma Zamanı Sorunları

#### 🔴 Backend Başlatılamıyor

```bash
# Bağımlılıkları kontrol edin
cd backend && npm list

# Eksik paketleri yükleyin
npm install

# Environment değişkenlerini kontrol edin
cat .env
```

#### 🟡 Frontend Hata Veriyor

```bash
# Cache'i temizleyin
rm -rf node_modules package-lock.json
npm install

# Browser cache'ini temizleyin
# Ctrl+Shift+R (hard refresh)
```

#### 🟡 API Bağlantı Hatası

- Backend'in çalıştığından emin olun
- Frontend `.env` dosyasındaki `VITE_API_URL`'nin doğru olduğundan emin olun
- CORS ayarlarını kontrol edin

---

## 📚 Ek Kaynaklar

### 📖 Dokümantasyon

- **[Ana Wiki Sayfası](Home.md)** - Tüm dokümantasyon
- **[Kullanıcı Rehberi](User-Guide.md)** - Detaylı kullanım talimatları
- **[Geliştirici Rehberi](Developer-Guide.md)** - Teknik dokümantasyon

### 🎥 Video Eğitimler

- [Kurulum Videosu](https://youtube.com/watch?v=jun-oro-setup)
- [İlk Kullanım Videosu](https://youtube.com/watch?v=jun-oro-first-steps)
- [Özellik Tanıtımı](https://youtube.com/watch?v=jun-oro-features)

### 🤝 Topluluk

- **Discord**: [Sunucumuza katılın](https://discord.gg/jun-oro)
- **GitHub**: [Issue bildirin](https://github.com/Poppolouse/jun-oro/issues)
- **Forum**: [Tartışmalara katılın](https://forum.jun-oro.com)

---

## ✅ Kurulum Kontrol Listesi

### 📋 Ön Kurulum

- [ ] Node.js 18+ yüklü mü?
- [ ] PostgreSQL 14+ yüklü mü?
- [ ] Git yüklü mü?
- [ ] Yeterli disk alanı var mı?

### 📦 Kurulum

- [ ] Proje klonlandı mı?
- [ ] Frontend bağımlılıkları yüklendi mi?
- [ ] Backend bağımlılıkları yüklendi mi?
- [ ] Environment dosyaları oluşturuldu mu?
- [ ] Veritabanı migrasyonları çalıştırıldı mı?

### 🚀 Test

- [ ] Frontend çalışıyor mu? (http://localhost:5173)
- [ ] Backend çalışıyor mu? (http://localhost:3000)
- [ ] API dokümantasyonu erişilebilir mi?
- [ ] Veritabanı bağlantısı başarılı mı?

---

## 🎉 Tebrikler!

Jun-Oro'yu başarıyla kurduğunuza göre! Artık oyun kütüphanenizi yönetmeye, oyun sürelerinizi takip etmeye ve oyun alışkanlıklarınızı analiz etmeye hazırsınız.

### 📈 Sonraki Adımlar

1. **[Kullanıcı Rehberi](User-Guide.md)**'ni inceleyin
2. **[Oyun Kütüphanesi Yönetimi](Library-Management.md)**'ni öğrenin
3. **[Oyun Oturumları](Session-Tracking.md)**'ni keşfedin
4. **[İstatistikler](Statistics.md)**'ni kullanın

---

**Yardıma ihtiyacınız olursa [Sorun Giderme](Troubleshooting.md) sayfasını ziyaret edin! 🛠️**

---

_Son güncelleme: 10 Kasım 2025_
_İlgili sayfalar: [Home](Home.md) • [User-Guide](User-Guide.md) • [Troubleshooting](Troubleshooting.md)_

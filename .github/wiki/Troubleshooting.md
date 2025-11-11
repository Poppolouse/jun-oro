# 🛠️ Sorun Giderme

Jun-Oro projesini kullanırken karşılaşabileceğiniz yaygın sorunların çözümleri ve hata ayıklama ipuçları.

## 📋 İçindekiler

- [Kurulum Sorunları](#kurulum-sorunları)
- [Bağlantı ve API Sorunları](#bağlantı-ve-api-sorunları)
- [Veritabanı Sorunları](#veritabanı-sorunları)
- [Frontend Sorunları](#frontend-sorunları)
- [Performans Sorunları](#performans-sorunları)
- [Oyun Verileri Sorunları](#oyun-verileri-sorunları)
- [Steam Entegrasyonu](#steam-entegrasyonu)
- [IGDB Entegrasyonu](#igdb-entegrasyonu)
- [Bildirim Sorunları](#bildirim-sorunları)
- [Geliştirme Sorunları](#geliştirme-sorunları)

---

## 🔧 Kurulum Sorunları

### Node.js Sürüm Uyuşmazlığı

**Sorun:** `Unsupported Node.js version` hatası alıyorum.

**Çözüm:**
```bash
# Node.js sürümünü kontrol et
node --version

# Gerekli sürümü kur (örneğin: v18.x)
nvm install 18
nvm use 18
```

**Not:** Jun-Oro, Node.js 18+ sürümünü gerektirir.

### NPM Paket Kurulum Hataları

**Sorun:** `npm install` sırasında hata alıyorum.

**Çözümler:**
```bash
# 1. Cache'i temizle
npm cache clean --force

# 2. Node modules'i sil ve yeniden kur
rm -rf node_modules package-lock.json
npm install

# 3. Eğer devam ederse, force ile kur
npm install --force
```

### Port Zaten Kullanımda

**Sorun:** `Port 3000 is already in use` hatası.

**Çözümler:**
```bash
# 1. Farklı port kullan
npm run dev -- --port 3001

# 2. Port'u kullanan işlemi bul ve sonlandır
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

---

## 🌐 Bağlantı ve API Sorunları

### Backend Bağlantı Hatası

**Sorun:** Frontend backend'e bağlanamıyor.

**Çözümler:**
```bash
# 1. Backend'in çalıştığını kontrol et
curl http://localhost:5000/api/health

# 2. CORS ayarlarını kontrol et
# backend/src/index.js dosyasında CORS middleware'i kontrol et

# 3. Environment değişkenlerini kontrol et
cat backend/.env
```

**Frontend proxy ayarı (vite.config.js):**
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### API Rate Limiting

**Sorun:** `Too Many Requests` hatası alıyorum.

**Çözümler:**
- API çağrılarını azalt
- Request'leri batch yap
- Cache kullan
- Rate limit header'larını kontrol et

---

## 🗄️ Veritabanı Sorunları

### Bağlantı Başarısız

**Sorun:** Database connection failed.

**Çözümler:**
```bash
# 1. PostgreSQL'in çalıştığını kontrol et
pg_isready -h localhost -p 5432

# 2. Connection string'i kontrol et
echo $DATABASE_URL

# 3. Migration'ları çalıştır
npx prisma migrate deploy

# 4. Database'i reset et (son çare)
npx prisma migrate reset
```

### Migration Hataları

**Sorun:** Migration sırasında hata alıyorum.

**Çözümler:**
```bash
# 1. Migration durumunu kontrol et
npx prisma migrate status

# 2. Bekleyen migration'ları çöz
npx prisma migrate resolve

# 3. Yeni migration oluştur
npx prisma migrate dev --name fix_migration

# 4. Schema ile database'i senkronize et
npx prisma db push
```

### Prisma Client Hatası

**Sorun:** `PrismaClient is unable to run` hatası.

**Çözümler:**
```bash
# 1. Client'i yeniden oluştur
npx prisma generate

# 2. Node modules'i temizle ve yeniden kur
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

---

## 🎨 Frontend Sorunları

### White Screen (Boş Ekran)

**Sorun:** Uygulama açılıyor ama beyaz ekran görüyorum.

**Çözümler:**
```bash
# 1. Console'u kontrol et (F12)
# JavaScript hatalarını kontrol et

# 2. Build'i kontrol et
npm run build

# 3. Development server'ı yeniden başlat
npm run dev
```

**Browser console'da kontrol et:**
- JavaScript hataları
- Network hataları
- Console log'ları

### CSS/Styling Sorunları

**Sorun:** Stiller düzgün yüklenmiyor.

**Çözümler:**
```bash
# 1. CSS import'larını kontrol et
# src/index.css dosyasının import edildiğinden emin ol

# 2. Tailwind CSS'i kontrol et
# tailwind.config.js dosyasını kontrol et

# 3. Build process'i kontrol et
npm run build
```

### React Component Hataları

**Sorun:** Component render hatası alıyorum.

**Çözümler:**
```javascript
// 1. Error boundary kullan
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <YourComponent />
</ErrorBoundary>

// 2. PropTypes veya TypeScript kontrol et
// Props'un doğru geçtiğinden emin ol
```

---

## ⚡ Performans Sorunları

### Yavaş Yükleme

**Sorun:** Uygulama yavaş yükleniyor.

**Çözümler:**
```bash
# 1. Bundle boyutunu kontrol et
npm run build
npx vite-bundle-analyzer dist

# 2. Lazy loading kullan
const LazyComponent = lazy(() => import('./Component'));

# 3. Resimleri optimize et
# WebP formatı kullan
# Resimleri sıkıştır
```

### Memory Leak

**Sorun:** Sayfa değiştirdikçe RAM kullanımı artıyor.

**Çözümler:**
```javascript
// 1. useEffect cleanup'ları kontrol et
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  
  return () => clearInterval(timer); // Cleanup
}, []);

// 2. Event listener'ları temizle
useEffect(() => {
  const handleResize = () => {};
  window.addEventListener('resize', handleResize);
  
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## 🎮 Oyun Verileri Sorunları

### Oyun Bulunamadı

**Sorun:** Eklediğim oyunları göremiyorum.

**Çözümler:**
```bash
# 1. Database'i kontrol et
npx prisma studio

# 2. API endpoint'ini test et
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/library/games

# 3. User ID'sini kontrol et
# JWT token'ını decode et ve user ID'sini kontrol et
```

### Oyun Kapak Görselleri Yüklenmiyor

**Sorun:** Oyun kapak görselleri görünmüyor.

**Çözümler:**
```bash
# 1. Cloudflare R2 ayarlarını kontrol et
# CORS ayarlarını kontrol et

# 2. Image URL'lerini kontrol et
# URL'lerin doğru formatta olduğundan emin ol

# 3. LazyImage component'ini kontrol et
# src/components/LazyImage.jsx
```

---

## 🚂 Steam Entegrasyonu

### Steam API Key Hatası

**Sorun:** Steam API key çalışmıyor.

**Çözümler:**
```bash
# 1. API key'i kontrol et
echo $STEAM_API_KEY

# 2. Steam Web API key'inin geçerli olduğundan emin ol
# https://steamcommunity.com/dev/apikey

# 3. Rate limit'i kontrol et
# Steam API: 100,000 calls/day
```

### Steam Import Başarısız

**Sorun:** Steam kütüphanesi import edilemiyor.

**Çözümler:**
```bash
# 1. Profile URL'sini kontrol et
# https://steamcommunity.com/profiles/<steamid>/games

# 2. Privacy ayarlarını kontrol et
# Steam profilinin public olduğundan emin ol

# 3. API response'unu kontrol et
curl "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=$STEAM_API_KEY&steamid=<steamid>&format=json"
```

---

## 🎯 IGDB Entegrasyonu

### IGDB API Key Hatası

**Sorun:** IGDB API key çalışmıyor.

**Çözümler:**
```bash
# 1. Client ID ve Secret'i kontrol et
echo $IGDB_CLIENT_ID
echo $IGDB_CLIENT_SECRET

# 2. Access token'ı yenile
curl -d "grant_type=client_credentials&client_id=$IGDB_CLIENT_ID&client_secret=$IGDB_CLIENT_SECRET" \
     https://id.igdb.com/oauth2/token

# 3. Rate limit'i kontrol et
# IGDB API: 4 requests/second
```

### Oyun Arama Sonuçları Boş

**Sorun:** IGDB'de oyun arama sonuçları boş geliyor.

**Çözümler:**
```bash
# 1. Search query'sini kontrol et
# Minimum 3 karakter gerekli

# 2. API request formatını kontrol et
# body: `search "game name"; fields name,cover.url;`

# 3. Fields'ı kontrol et
# Gerekli field'ların request'te olduğundan emin ol
```

---

## 🔔 Bildirim Sorunları

### Bildirimler Gelmiyor

**Sorun:** Fiyat düşüşü bildirimlerini almıyorum.

**Çözümler:**
```bash
# 1. Notification settings'i kontrol et
# User preferences'de bildirimlerin açık olduğundan emin ol

# 2. Email ayarlarını kontrol et
# SMTP ayarlarının doğru olduğundan emin ol

# 3. Cron job'u kontrol et
# Fiyat kontrol script'inin çalıştığından emin ol
```

### Browser Bildirimleri Çalışmıyor

**Sorun:** Browser bildirimleri görünmüyor.

**Çözümler:**
```javascript
// 1. Permission kontrol et
Notification.requestPermission().then(permission => {
  console.log(permission);
});

// 2. Service Worker'ı kontrol et
// public/sw.js dosyasının doğru çalıştığından emin ol

// 3. HTTPS kontrol et
// Browser bildirimleri HTTPS gerektirir
```

---

## 👨‍💻 Geliştirme Sorunları

### Test Hataları

**Sorun:** Testler başarısız oluyor.

**Çözümler:**
```bash
# 1. Test environment'ını kontrol et
npm test -- --run

# 2. Mock'ları kontrol et
# __mocks__ klasöründeki mock dosyalarını kontrol et

# 3. Test coverage'ı kontrol et
npm test -- --coverage
```

### Lint Hataları

**Sorun:** ESLint hataları alıyorum.

**Çözümler:**
```bash
# 1. Auto-fix
npm run lint -- --fix

# 2. Manuel fix
# Hataları tek tek düzelt

# 3. Lint kurallarını kontrol et
# .eslintrc.cjs dosyasını kontrol et
```

### TypeScript Hataları

**Sorun:** TypeScript derleme hataları.

**Çözümler:**
```bash
# 1. Type check
tsc --noEmit

# 2. Type definitions'ı kontrol et
# @types paketlerinin kurulu olduğundan emin ol

# 3. tsconfig.json'ı kontrol et
# Compiler options'ları kontrol et
```

---

## 🔍 Debugging İpuçları

### Log'lama

**Backend log'ları:**
```javascript
// Structured logging kullan
console.log({
  timestamp: new Date().toISOString(),
  level: 'info',
  message: 'User login attempt',
  userId: user.id,
  ip: req.ip
});
```

**Frontend log'ları:**
```javascript
// Development'de detaylı log
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Error boundary'de log
console.error('Component error:', error, errorInfo);
```

### Network Debugging

**Browser DevTools:**
1. Network tab'ı aç
2. API request'lerini filtrele
3. Request/Response'ları incele
4. Status code'ları kontrol et
5. Headers'ları kontrol et

**cURL komutları:**
```bash
# GET request
curl -v -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/games

# POST request
curl -v -X POST -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"title":"Test Game"}' \
     http://localhost:5000/api/games
```

### Database Debugging

**Prisma Studio:**
```bash
npx prisma studio
```

**Raw SQL:**
```bash
# PostgreSQL console
psql -h localhost -U username -d database

# Query'leri çalıştır
SELECT * FROM "Game" LIMIT 10;
```

---

## 📞 Destek Kanalları

### Yardım İçin:
1. **GitHub Issues:** [Proje Issues](https://github.com/username/jun-oro/issues)
2. **Discord:** [Jun-Oro Community](https://discord.gg/jun-oro)
3. **Documentation:** [Wiki Ana Sayfa](Home)
4. **FAQ:** [Sıkça Sorulan Sorular](FAQ)

### Hata Raporlama:
Hata raporu gönderirken şu bilgileri ekleyin:
- Operating System ve sürümü
- Node.js sürümü
- Browser ve sürümü
- Tam hata mesajı
- Adımları yeniden oluşturma
- Console log'ları (varsa)
- Network request/response'ları (varsa)

---

## 🔗 İlgili Sayfalar

- [Home](Home) - Wiki ana sayfası
- [Getting Started](Getting-Started) - Kurulum rehberi
- [Developer Guide](Developer-Guide) - Geliştirici rehberi
- [API Reference](API-Reference) - API dokümantasyonu
- [FAQ](FAQ) - Sıkça sorulan sorular

---

## 🏷️ Etiketler

`troubleshooting` `debugging` `errors` `solutions` `support` `help` `issues` `fixes`
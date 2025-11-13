# Jun-Oro Gaming Platform

Jun-Oro, oyun kütüphanesi yönetimi ve oyun takibi için tasarlanmış modern bir web uygulamasıdır. Kullanıcıların oyun koleksiyonlarını yönetmelerine, oyun sürelerini takip etmelerine ve oyun verilerini analiz etmelerine olanak tanır.

## 🎯 Proje Amacı

Jun-Oro, oyuncular için tek bir merkezde oyun kütüphanelerini yönetme, oyun sürelerini takip etme ve oyun verilerini analiz etme imkanı sunar. Platform, kullanıcıların oyun alışkanlıklarını daha iyi anlamalarına ve yeni oyunlar keşfetmelerine yardımcı olur.

## 🛠️ Kullanılan Teknolojiler

### Frontend

- **React 18** - Modern UI bileşenleri için
- **Vite** - Hızlı geliştirme ve build süreci
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon kütüphanesi
- **React DnD** - Drag and drop functionality

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma** - Modern database toolkit
- **PostgreSQL** - Veritabanı
- **JWT** - Authentication
- **Zod** - Schema validation
- **Bcrypt** - Password hashing

### External APIs

- **IGDB API** - Oyun verileri
- **Steam API** - Steam entegrasyonu
- **HowLongToBeat API** - Oyun süreleri
- **Metacritic API** - Oyun puanları

### Storage

- **Cloudflare R2** - Dosya depolama

### Testing

- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Jest** - Backend testing

## 🚀 Kurulum Adımları

### Ön Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Projeyi Klonlama

```bash
git clone https://github.com/Poppolouse/jun-oro.git
cd jun-oro
```

### 2. Frontend Kurulumu

```bash
# Ana dizinde
npm install

# Environment dosyası oluşturma
cp .env.example .env
# .env dosyasını düzenleyin
```

### 3. Backend Kurulumu

```bash
# Backend dizinine geçiş
cd backend

# Bağımlılıkları yükle
npm install

# Environment dosyası oluşturma
cp .env.example .env
# .env dosyasını düzenleyin
```

### 4. Veritabanı Kurulumu

```bash
# Backend dizininde
npm run db:migrate
npm run db:generate
```

### 5. Uygulamayı Çalıştırma

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## 🏁 Hızlı Başlangıç

1. **Kurulum tamamlandıktan sonra** uygulama `http://localhost:5173` adresinde çalışacaktır
2. **Backend API** `http://localhost:3000` adresinde çalışacaktır
3. **API dokümantasyonu** için `http://localhost:3000/api-docs` adresini ziyaret edin
4. **Veritabanı yönetimi** için `npm run db:studio` komutunu çalıştırın

## 📁 Proje Yapısı

```
jun-oro/
├── src/                    # Frontend kaynak kodları
│   ├── components/         # React bileşenleri
│   ├── pages/              # Sayfa bileşenleri
│   ├── hooks/              # Custom hooks
│   ├── services/           # API servisleri
│   ├── utils/              # Utility fonksiyonları
│   └── contexts/           # React context'leri
├── backend/                # Backend kaynak kodları
│   ├── src/
│   │   ├── routes/         # API route'ları
│   │   ├── middleware/     # Middleware'ler
│   │   ├── lib/           # Kütüphane dosyaları
│   │   └── models/        # Veri modelleri
│   ├── prisma/            # Prisma dosyaları
│   └── scripts/           # Script dosyaları
├── docs/                  # Dokümantasyon
├── public/                # Statik dosyalar
└── tests/                 # Test dosyaları
```

## 📋 Mevcut Komutlar

### Frontend Komutları

```bash
npm run dev              # Geliştirme sunucusunu başlat
npm run build            # Production build oluştur
npm run preview          # Build'i önizle
npm run lint             # ESLint kontrolü
npm run test             # Testleri çalıştır
npm run test:coverage    # Test coverage raporu
```

### Backend Komutları

```bash
npm run dev              # Geliştirme sunucusunu başlat
npm run start            # Production sunucusunu başlat
npm run test             # Testleri çalıştır
npm run db:migrate       # Veritabanı migrasyonu
npm run db:studio        # Prisma Studio aç
npm run db:reset         # Veritabanını sıfırla
```

## 🔗 Katılım Kuralları

Projeye katkıda bulunmak için lütfen aşağıdaki dokümanları inceleyin:

- [Katılım Rehberi](docs/CONTRIBUTING.md) - Projeye nasıl katkıda bulunulur
- [Kodlama Standartları](docs/CODING-STANDARDS.md) - Kod yazım kuralları
- [ERS Sistemi](docs/ERS-REGISTRY.md) - Element Registry System
- [Mimari Dokümantasyonu](docs/ARCHITECTURE.md) - Sistem mimarisi

## 📚 Dokümantasyon

- [Kullanıcı Rehberi](docs/user-guide/) - Uygulama kullanımı
- [Geliştirici Dokümantasyonu](docs/developer/) - Teknik detaylar
- [Veritabanı Şeması](docs/DATABASE.md) - Veritabanı yapısı
- [Deployment Rehberi](docs/DEPLOYMENT.md) - Yayınlama süreci

## 🤝 Destek

Sorularınız veya önerileriniz için:

- GitHub Issues üzerinden issue oluşturun
- [FAQ](docs/FAQ.md) sayfasını inceleyin

## 📄 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

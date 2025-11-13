# Jun-Oro Developer Setup Guide

## Overview

Jun-Oro oyun kütüphanesi ve yönetim sistemi için geliştirme ortamı kurulum rehberi.

## Prerequisites

### Required Software

- **Node.js**: v18+ (LTS sürümü tavsiye edilir)
- **npm**: v8+ (Node.js ile birlikte gelir)
- **Git**: v2.30+
- **VS Code**: Tavsiye edilen editör
- **PostgreSQL**: v15+ (development için)
- **Docker**: v20+ (opsiyonel)

### VS Code Extensions (Tavsiye edilen)

- **ES7+ ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Prisma**: Database management
- **Thunder Client**: PostgreSQL client
- **GitLens**: Git integration
- **Auto Rename Tag**: HTML/JSX tag renaming
- **Import Cost**: Import performance analysis

## Project Structure

```
jun-oro/
├── backend/                 # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── lib/          # Utility libraries
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── docs/          # API documentation
│   ├── prisma/            # Database schema & migrations
│   ├── scripts/            # Database scripts
│   └── tests/             # Backend tests
├── src/                    # Frontend (React/Vite)
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   └── tests/             # Frontend tests
├── docs/                   # Documentation
├── public/                 # Static assets
└── tests/                  # E2E tests
```

## Setup Instructions

### 1. Repository Clone

```bash
git clone https://github.com/your-org/jun-oro.git
cd jun-oro
```

### 2. Backend Setup

```bash
# Backend dizinine git
cd backend

# Dependencies kurulum
npm install

# Environment variables kopyala
cp .env.example .env

# .env dosyasını düzenle
# DATABASE_URL, JWT_SECRET, API_KEYS gibi değerleri gir
```

#### Backend Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jun_oro"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# API Keys (External services)
IGDB_CLIENT_ID="your-igdb-client-id"
IGDB_CLIENT_SECRET="your-igdb-client-secret"
STEAM_API_KEY="your-steam-api-key"

# File Storage
CLOUDFLARE_R2_ACCESS_KEY="your-r2-access-key"
CLOUDFLARE_R2_SECRET_KEY="your-r2-secret-key"
CLOUDFLARE_R2_BUCKET="your-bucket-name"
CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Cache Configuration
CACHE_DEFAULT_TTL=300
CACHE_MAX_TTL=3600
CACHE_CLEANUP_INTERVAL=600000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Frontend Setup

```bash
# Ana dizine geri dön
cd ..

# Frontend dependencies kurulum
npm install

# Environment variables kopyala
cp .env.example .env

# .env dosyasını düzenle
# VITE_API_URL gibi değerleri gir
```

#### Frontend Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
VITE_ENABLE_TUTORIAL=true

# External Services
VITE_STEAM_API_URL=https://store.steampowered.com
VITE_IGDB_API_URL=https://api.igdb.com/v4
```

### 4. Database Setup

#### Option A: Local PostgreSQL

```bash
# PostgreSQL kurulum (macOS with Homebrew)
brew install postgresql@15
brew services start postgresql

# Database oluştur
createdb jun_oro

# User oluştur
createuser --interactive

# .env dosyasını güncelle
DATABASE_URL="postgresql://username:password@localhost:5432/jun_oro"
```

#### Option B: Docker

```bash
# PostgreSQL container başlat
docker run --name postgres-jun-oro \
  -e POSTGRES_DB=jun_oro \
  -e POSTGRES_USER=jun_oro \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# .env dosyasını güncelle
DATABASE_URL="postgresql://jun_oro:password@localhost:5432/jun_oro"
```

### 5. Database Migration

```bash
# Backend dizinine git
cd backend

# Prisma client oluştur
npm run db:generate

# Database migration çalıştır
npm run db:migrate

# (İsteğe bağlı) Seed data yükle
npm run db:seed
```

### 6. Development Servers

#### Backend Development Server

```bash
cd backend
npm run dev
# Server: http://localhost:3001
```

#### Frontend Development Server

```bash
# Yeni terminal aç
npm run dev
# Server: http://localhost:3000
```

## Development Workflow

### 1. Code Quality

#### ESLint Configuration

```bash
# Tüm proje için lint kontrolü
npm run lint

# Otomatik düzeltme
npm run lint -- --fix
```

#### Prettier Formatting

```bash
# Format kontrolü
npm run prettier:check

# Otomatik formatlama
npm run prettier:write
```

#### TypeScript Check

```bash
# Type kontrolü
npm run type-check
```

### 2. Testing

#### Unit Tests

```bash
# Frontend unit tests
npm run test:unit

# Backend unit tests
cd backend && npm run test:unit
```

#### Integration Tests

```bash
# Frontend integration tests
npm run test:integration

# Backend integration tests
cd backend && npm run test:integration
```

#### E2E Tests

```bash
# E2E tests
npm run test:e2e
```

#### Test Coverage

```bash
# Coverage raporu oluştur
npm run test:coverage

# Coverage raporu görüntüle
open coverage/lcov-report/index.html
```

### 3. Database Management

#### Prisma Studio

```bash
# Database GUI
cd backend && npm run db:studio
# Browser: http://localhost:5555
```

#### Database Reset

```bash
# DANGER: Production'da kullanma!
cd backend && npm run db:reset
```

### 4. Build Process

#### Development Build

```bash
# Frontend build
npm run build

# Backend build
cd backend && npm run build
```

#### Production Build

```bash
# Production build
npm run build:prod
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# PostgreSQL çalıştığını kontrol et
pg_isready -d jun_oro

# Connection string doğrula
psql $DATABASE_URL -c "SELECT 1;"
```

#### 2. Port Conflicts

```bash
# Port kullanımını kontrol et
lsof -i :3000
lsof -i :3001

# Process sonlandır
kill -9 <PID>
```

#### 3. Dependency Issues

```bash
# Node modules temizle
rm -rf node_modules package-lock.json
npm install

# Cache temizle
npm cache clean --force
```

#### 4. TypeScript Errors

```bash
# Type check detaylı
npm run type-check -- --noEmit

# Prisma types yeniden oluştur
npm run db:generate
```

## Development Best Practices

### 1. Git Workflow

```bash
# Feature branch oluştur
git checkout -b feature/your-feature-name

# Commit mesaj formatı
git commit -m "feat: add new game search functionality"

# Branch güncelle
git pull origin main
git rebase main
```

### 2. Code Organization

- Component'leri `src/components/` altında organize et
- Utility fonksiyonlarını `src/utils/` altında tut
- API calls için `src/services/` kullan
- Custom hooks için `src/hooks/` kullan

### 3. Environment Management

- Sensitive verileri asla repo'ya commit etme
- `.env.example` dosyasını güncel tut
- Production için ayrı environment'lar kullan

### 4. Performance Optimization

- Bundle size analizini düzenli yap
- Lazy loading kullan
- Code splitting uygulama
- Image optimizasyonu yap

## Additional Resources

### Documentation

- [API Documentation](../api-reference.md)
- [Database Schema](../database-schema.md)
- [Component Library](../component-library.md)
- [Testing Guide](../testing-guide.md)

### External Links

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Vite Documentation](https://vitejs.dev/)

### Community

- [GitHub Discussions](https://github.com/your-org/jun-oro/discussions)
- [Discord Server](https://discord.gg/jun-oro)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/jun-oro)

## Support

### Getting Help

1. **Documentation**: Önce docs/ klasörünü kontrol et
2. **Issues**: GitHub'da issue oluştur
3. **Discord**: Real-time yardım için
4. **Team Lead**: Kritik sorunlar için

### Contributing Guidelines

1. Fork repository
2. Feature branch oluştur
3. Changes yap
4. Tests yaz
5. PR oluştur
6. Code review bekle
7. Merge et

---

**İpucu**: Bu setup guide'i düzenli olarak güncelleyin. Yeni tool'lar veya best practices eklendiğinde burayı güncelleyin.

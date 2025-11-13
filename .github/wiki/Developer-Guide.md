# 🛠️ Geliştirici Rehberi

Jun-Oro projesine katkıda bulunmak için gereken teknik bilgiler, kurulum adımları ve geliştirme süreçleri hakkında detaylı rehber.

## 📋 İçindekiler

- [Geliştirici Ortamı Kurulumu](#geliştirici-ortamı-kurulumu)
- [Proje Yapısı](#proje-yapısı)
- [Kodlama Standartları](#kodlama-standartları)
- [Frontend Geliştirme](#frontend-geliştirme)
- [Backend Geliştirme](#backend-geliştirme)
- [Veritabanı Geliştirme](#veritabanı-geliştirme)
- [Test Süreci](#test-süreci)
- [Katılım Süreci](#katılım-süreci)
- [Code Review Süreci](#code-review-süreci)

## 🚀 Geliştirici Ortamı Kurulumu

### Sistem Gereksinimleri

| Gereksinim             | Minimum                               | Tavsiye Edilen                     |
| ---------------------- | ------------------------------------- | ---------------------------------- |
| 💻 **İşletim Sistemi** | Windows 10, macOS 10.15, Ubuntu 18.04 | Windows 11, macOS 12, Ubuntu 20.04 |
| 🟢 **Node.js**         | v16.0.0                               | v18.0.0+                           |
| 📦 **npm**             | v8.0.0                                | v9.0.0+                            |
| 🗄️ **Git**             | v2.30.0                               | v2.40.0+                           |
| 🐘 **PostgreSQL**      | v13.0                                 | v15.0+                             |
| 🌐 **Browser**         | Chrome 90+, Firefox 88+               | Chrome 100+, Firefox 100+          |

### Geliştirme Araçları

#### Zorunlu Araçlar

```bash
# Node.js ve npm kurulumu
# https://nodejs.org/en/download/

# Git kurulumu
# https://git-scm.com/downloads

# PostgreSQL kurulumu
# https://www.postgresql.org/download/
```

#### Tavsiye Edilen VS Code Extension'ları

| Extension                                     | Açıklama               |
| --------------------------------------------- | ---------------------- |
| 📦 **ES7+ React/Redux/React-Native snippets** | React kod parçacıkları |
| 🎨 **Prettier - Code formatter**              | Kod formatlama         |
| 🔍 **ESLint**                                 | Kod kalitesi kontrolü  |
| 🌈 **GitLens**                                | Git geliştirmeleri     |
| 🧪 **Thunder Client**                         | API test etme          |
| 🐳 **Docker**                                 | Konteyner yönetimi     |
| 📊 **Thunder Client**                         | API test etme          |

### Kurulum Adımları

1. **Depoyu Klonla**:

   ```bash
   git clone https://github.com/jun-oro/jun-oro.git
   cd jun-oro
   ```

2. **Backend Kurulumu**:

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # .env dosyasını yapılandır
   ```

3. **Frontend Kurulumu**:

   ```bash
   cd ..
   npm install
   ```

4. **Veritabanı Kurulumu**:

   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Geliştirme Sunucusunu Başlat**:

   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   npm run dev
   ```

## 🏗️ Proje Yapısı

### Genel Proje Yapısı

```
jun-oro/
├── .github/                    # GitHub workflows ve wiki
├── .roo/                       # Roo mod yapılandırmaları
├── backend/                      # Backend uygulaması
│   ├── prisma/                 # Veritabanı şemaları
│   ├── src/                     # Kaynak kodları
│   │   ├── routes/             # API rotaları
│   │   ├── middleware/          # Express middleware'ları
│   │   ├── services/            # İş mantığı servisleri
│   │   ├── lib/                 # Harici kütüphane entegrasyonları
│   │   └── utils/               # Yardımcı fonksiyonlar
│   ├── tests/                    # Backend testleri
│   └── scripts/                  # Veritabanı script'leri
├── docs/                        # Proje dokümantasyonu
│   ├── user-guide/              # Kullanıcı rehberi
│   ├── developer/               # Geliştirici dokümantasyonu
│   └── design-archive/           # Tasarım arşivi
├── public/                      # Statik dosyalar
├── src/                         # Frontend kaynak kodları
│   ├── components/              # React component'leri
│   ├── pages/                   # Sayfa component'leri
│   ├── hooks/                   # Custom hook'lar
│   ├── services/                # API servisleri
│   ├── utils/                   # Yardımcı fonksiyonlar
│   ├── contexts/                # React context'leri
│   └── styles/                  # Global stiller
├── tests/                       # Frontend testleri
└── tools/                       # Geliştirme araçları
```

### Frontend Yapısı

```
src/
├── components/
│   ├── common/                   # Ortak component'ler (Button, Input, Modal)
│   ├── forms/                    # Form component'leri (LoginForm, RegisterForm)
│   ├── layout/                   # Layout component'leri (Header, Footer, Sidebar)
│   └── features/                 # Özellik özelinde component'ler
├── pages/                           # Sayfa component'leri
├── hooks/                           # Custom hook'lar
├── services/                        # API servisleri
├── utils/                           # Yardımcı fonksiyonlar
├── contexts/                        # React context'leri
├── styles/                          # Global stiller
└── assets/                          # Statik varlıklar (resimler, fontlar)
```

### Backend Yapısı

```
backend/src/
├── routes/                          # API rotaları
├── middleware/                       # Express middleware'ları
├── services/                         # İş mantığı servisleri
├── lib/                             # Harici kütüphane entegrasyonları
├── utils/                           # Yardımcı fonksiyonlar
└── config/                          # Yapılandırma dosyaları
```

## 📏 Kodlama Standartları

### Genel Kurallar

- ✅ **Dosya Boyutu**: Max 300 satır (ideal), 500+ satır refactor gerekli
- ✅ **Fonksiyon Boyutu**: Max 50 satır (ideal), 100+ satır refactor gerekli
- ✅ **Naming Conventions**: camelCase (değişkenler/fonksiyonlar), PascalCase (component'ler)
- ✅ **Comment'ler**: Her public fonksiyon üstünde JSDoc comment
- ✅ **Error Handling**: Her async fonksiyonda try-catch
- ✅ **Validation**: Input validation her zaman (frontend + backend)

### Frontend Standartları

#### Component Şablonu

```jsx
import React, { useState, useEffect } from "react";

/**
 * Component açıklaması
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effect logic
  }, [dependency]);

  // Early return pattern
  if (!condition) {
    return null;
  }

  return (
    <div className="component-name" data-ers="PAGE.SECTION.CONTAINER.ELEMENT">
      {/* JSX content */}
    </div>
  );
}
```

#### Hook Şablonu

```jsx
import { useState, useCallback } from "react";

/**
 * Hook açıklaması
 * @param {type} param - Parametre açıklaması
 * @returns {Array} Return değerleri
 */
export function useCustomHook(param) {
  const [state, setState] = useState(initialState);

  const action = useCallback(() => {
    // Action logic
  }, [dependencies]);

  return [state, action];
}
```

### Backend Standartları

#### Route Şablonu

```javascript
import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const schema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
});

/**
 * Route açıklaması
 * @route POST /api/endpoint
 * @access Private
 */
router.post(
  "/endpoint",
  authenticateToken,
  validateRequest(schema),
  async (req, res, next) => {
    try {
      // Business logic
      const result = await processRequest(req.body);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
```

#### Service Şablonu

```javascript
/**
 * Service açıklaması
 * @param {Object} data - Request data
 * @returns {Promise} API response
 */
export async function serviceFunction(data) {
  try {
    const response = await api.post("/endpoint", data);
    return response.data;
  } catch (error) {
    console.error("Service error:", error);
    throw error;
  }
}
```

## ⚛️ Frontend Geliştirme

### Teknoloji Stack'i

| Teknoloji           | Versiyon | Kullanım Alanı |
| ------------------- | -------- | -------------- |
| ⚛️ **React**        | 18.2.0+  | UI framework   |
| 🔄 **Vite**         | 4.0.0+   | Build tool     |
| 🎨 **Tailwind CSS** | 3.3.0+   | Styling        |
| 🗂️ **React Router** | 6.8.0+   | Routing        |

- 🏪 **Zustand** - State management
- 🧪 **Vitest** - Testing framework
- 📦 **Axios** - HTTP client

### Component Geliştirme

#### ERS (Element Registry System)

Her component'e ERS kodu eklemelisiniz:

```jsx
<div data-ers="1.3.1" className="game-grid">
  {games.map((game, i) => (
    <GameCard data-ers={`1.3.1.${i + 1}`} {...game} />
  ))}
</div>
```

#### State Management

Zustand store kullanımı:

```jsx
import { useGameStore } from "../stores/gameStore";

function GameComponent() {
  const { games, addGame, removeGame } = useGameStore();

  const handleAddGame = (game) => {
    addGame(game);
  };

  return <div>{/* Component content */}</div>;
}
```

### API Entegrasyonu

```jsx
import { gameService } from "../services/gameService";

async function loadGames() {
  try {
    const games = await gameService.getAllGames();
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

## 🔧 Backend Geliştirme

### Teknoloji Stack'i

| Teknoloji         | Versiyon | Kullanım Alanı |
| ----------------- | -------- | -------------- |
| 🟢 **Node.js**    | 18.0.0+  | Runtime        |
| 🌐 **Express**    | 4.18.0+  | Web framework  |
| 🗄️ **Prisma**     | 5.0.0+   | ORM            |
| 🐘 **PostgreSQL** | 15.0+    | Veritabanı     |
| 🔐 **JWT**        | 9.0.0+   | Authentication |

- ✅ **Zod** - Validation
- 📝 **Winston** - Logging

### API Geliştirme

#### Route Yapısı

```javascript
// routes/games.js
import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const gameSchema = z.object({
  title: z.string().min(1),
  genre: z.string().optional(),
  platform: z.string().min(1),
});

router.get("/", async (req, res) => {
  // Get games logic
});

router.post(
  "/",
  authenticateToken,
  validateRequest(gameSchema),
  async (req, res, next) => {
    // Create game logic
  },
);

export default router;
```

#### Middleware Geliştirme

```javascript
// middleware/validation.js
import { z } from "zod";

export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.errors,
      });
    }
  };
}
```

## 🗄️ Veritabanı Geliştirme

### Prisma Schema

```prisma
// prisma/schema.prisma
model Game {
  id        String    @id @default(cuid())
  title     String
  genre     String?
  platform  String
  status    GameStatus @default(PLAYING)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("games")
  @@index([platform])
  @@index([status])
}

enum GameStatus {
  PLAYING
  COMPLETED
  BACKLOG
}
```

### Migration Süreci

1. **Schema Değişikliği**:

   ```prisma
   // Yeni alan ekle
   model Game {
     // ... mevcut alanlar
     releaseDate DateTime? // yeni alan
   }
   ```

2. **Migration Oluşturma**:

   ```bash
   npx prisma migrate dev --name add_release_date
   ```

3. **Client Güncelleme**:
   ```bash
   npx prisma generate
   ```

## 🧪 Test Süreci

### Test Framework'leri

| Framework              | Kullanım Alanı            |
| ---------------------- | ------------------------- |
| 🧪 **Vitest**          | Unit/Integration testleri |
| 🎭 **Testing Library** | Component testleri        |
| 🎮 **Playwright**      | E2E testleri              |

### Test Yazma

#### Unit Test Örneği

```javascript
// services/gameService.test.js
import { describe, it, expect } from "vitest";
import { gameService } from "./gameService";

describe("gameService", () => {
  it("should get all games", async () => {
    const games = await gameService.getAllGames();
    expect(Array.isArray(games)).toBe(true);
  });

  it("should create a game", async () => {
    const gameData = {
      title: "Test Game",
      genre: "RPG",
      platform: "PC",
    };

    const game = await gameService.createGame(gameData);
    expect(game.title).toBe(gameData.title);
  });
});
```

#### Component Test Örneği

```jsx
// components/GameCard.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import GameCard from "./GameCard";

describe("GameCard", () => {
  it("should render game title", () => {
    const game = { title: "Test Game", genre: "RPG" };
    render(<GameCard game={game} />);

    expect(screen.getByText("Test Game")).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const mockOnClick = vi.fn();
    const game = { title: "Test Game" };

    render(<GameCard game={game} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).toHaveBeenCalledWith(game);
  });
});
```

### Test Çalıştırma

```bash
# Tüm testleri çalıştır
npm test

# Watch modunda çalıştır
npm run test:watch

# Coverage raporu oluştur
npm run test:coverage

# E2E testlerini çalıştır
npm run test:e2e
```

## 🤝 Katılım Süreci

### Branch Stratejisi

```bash
# Feature branch oluşturma
git checkout -b feature/oyun-ekleme

# Commit formatı
feat(library): oyun ekleme özelliği
fix(api): oyun arama hatası
docs(readme): kurulum rehberi güncelleme
```

### Pull Request Süreci

1. **PR Hazırlığı**:
   - ✅ Kod testleri geçiyor
   - ✅ Lint kurallarına uygun
   - ✅ Dokümantasyon güncellendi
   - ✅ ERS kayıtları yapıldı

2. **PR Template**:

   ```markdown
   ## Değişiklik Açıklaması

   Bu PR oyun ekleme özelliğini ekler.

   ## Değişiklik Türü

   - [ ] Yeni özellik
   - [ ] Hata düzeltme
   - [ ] Dokümantasyon

   ## Testler

   - [ ] Unit testleri eklendi
   - [ ] Integration testleri eklendi
   - [ ] E2E testleri eklendi

   ## Ekran Görüntüleri

   <!-- Gerekirse ekran görüntüleri ekleyin -->
   ```

3. **Code Review Checklist'i**:
   - [ ] Kod okunabilir mi?
   - [ ] Test coverage yeterli mi?
   - [ ] Performans etkisi kabul edilebilir mi?
   - [ ] Güvenlik açığı var mı?
   - [ ] Dokümantasyon tam mı?
   - [ ] ERS kayıtları yapıldı mı?

## 🔍 Code Review Süreci

### Review Kriterleri

| Kategori              | Kontrol Noktaları              |
| --------------------- | ------------------------------ |
| 🎯 **Fonksiyonellik** | Gereksinimler karşılanıyor mu? |
| 📏 **Kod Kalitesi**   | Standartlara uygun mu?         |
| 🧪 **Testler**        | Test yeterliliği var mı?       |
| 📚 **Dokümantasyon**  | Dokümantasyon güncel mi?       |
| 🔒 **Güvenlik**       | Güvenlik açığı var mı?         |

- 🚀 **Performans** - Performans etkisi nedir?

### Review İpuçları

1. **Yapıcı Geri Bildirim**:
   - "Bu kod iyi çalışıyor ama..."
   - "Şu şekilde daha iyi olabilir: ..."
   - "Belki şu yaklaşımı deneyebiliriz: ..."

2. **Spesifik Geri Bildirim**:
   - "Satır 42'de değişken ismi daha açıklayıcı olabilir"
   - "Bu fonksiyon 50+ satır, küçük fonksiyonlara bölün"
   - "Test eksik, şu senaryoyu ekleyin"

3. **Örnekler Sunma**:
   - Kod örnekleri ile
   - Alternatif çözümler ile
   - Best practice referansları ile

## 🔧 Geliştirme Araçları

### Yararlı Komutlar

```bash
# Lint kontrolü
npm run lint

# Lint otomatik düzeltme
npm run lint:fix

# TypeScript kontrolü
npm run type-check

# Build kontrolü
npm run build

# Test çalıştırma
npm test

# Coverage raporu
npm run test:coverage

# Veritabanı reset
npm run db:reset

# Veritabanı seed
npm run db:seed
```

### Debugging

#### Frontend Debugging

```javascript
// Browser'da debugging
console.log("Debug info:", data);
debugger; // Browser'da durdurma noktası

// React DevTools
// Component state ve props'ları inceleme
```

#### Backend Debugging

```javascript
// VS Code debugging
// launch.json konfigürasyonu
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/backend/src/index.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

## 📚 Kaynaklar

### Dokümantasyon

- 📖 [React Dokümantasyonu](https://react.dev/)
- 🎨 [Tailwind CSS](https://tailwindcss.com/)
- 🗄️ [Prisma Dokümantasyonu](https://www.prisma.io/docs/)
- 🟢 [Express.js](https://expressjs.com/)
- 🧪 [Vitest](https://vitest.dev/)

### Topluluk

- 💬 [Discord Sunucumuz](https://discord.gg/jun-oro)
- 🐦 [Twitter](https://twitter.com/JunOroGame)
- 📧 [E-posta](mailto:dev@jun-oro.com)

### Öğrenme Kaynakları

- 🎓 [React Patterns](https://reactpatterns.com/)
- 🏗️ [JavaScript Design Patterns](https://addyosmani.com/resources/essential-javascript-design-patterns/)
- 🧪 [Testing Best Practices](https://kentcdodds.com/blog/effective-testing)
- 🔒 [Security Best Practices](https://owasp.org/)

---

## 🔗 İlgili Sayfalar

- [Ana Sayfa](Home) - Jun-Oro platformuna genel bakış
- [API Referansı](API-Reference) - API endpoint'leri hakkında detaylı bilgi
- [Veritabanı Şeması](Database-Schema) - Veritabanı yapısı ve ilişkileri
- [Deployment](Deployment) - Production kurulumu ve süreçleri
- [Sıkça Sorulan Sorular](FAQ) - Yaygın sorular ve cevapları

---

**Etiketler**: `geliştirici-rehberi`, `kurulum`, `kodlama-standartları`, `test-süreci`, `katılım`

**Son Güncelleme**: 10 Kasım 2025

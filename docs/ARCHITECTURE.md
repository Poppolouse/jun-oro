# Jun-Oro Sistem Mimarisi

## 📋 Genel Bakış

Jun-Oro, modern bir oyun kütüphanesi yönetim platformudur. Mikroservis tabanlı bir yaklaşım benimseyerek ölçeklenebilir ve bakımı kolay bir yapı sunar. Sistem, frontend ve backend katmanlarından oluşur ve çeşitli external API'lerle entegre çalışır.

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                        Jun-Oro Platform                       │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │   Pages     │ │Components  │ │   Hooks     │             │
│  │             │ │             │ │             │             │
│  │ HomePage    │ │GameCard     │ │useAuth      │             │
│  │LibraryPage  │ │AddGameModal │ │useLibrary   │             │
│  │SettingsPage │ │Header       │ │useSettings  │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Node.js + Express)                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │   Routes    │ │Middleware   │ │   Services   │             │
│  │             │ │             │ │             │             │
│  │/api/games   │ │Auth         │ │GameService  │             │
│  │/api/users   │ │Validation   │ │UserService  │             │
│  │/api/library │ │Error        │ │LibraryService│             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Veri Katmanı                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │ PostgreSQL  │ │Prisma ORM   │ │Cloudflare R2│             │
│  │             │ │             │ │             │             │
│  │Users        │ │Models       │ │Images       │             │
│  │Games        │ │Migrations   │ │Files        │             │
│  │Library      │ │Relations    │ │Backups      │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  External API'lar                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │   IGDB      │ │   Steam     │ │HowLongToBeat│             │
│  │             │ │             │ │             │             │
│  │Game Data    │ │User Library │ │Time Data    │             │
│  │Cover Images │ │Achievements │ │Completion   │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Frontend Mimarisi

### Component Hiyerarşisi

```
App.jsx
├── Router
├── AuthContext
├── NavigationContext
└── Pages
    ├── HomePage
    │   ├── Header
    │   ├── GameGrid
    │   │   └── GameCard[]
    │   └── Footer
    ├── LibraryPage
    │   ├── Header
    │   ├── FilterBar
    │   ├── LibraryGrid
    │   │   └── LibraryCard[]
    │   └── AddGameModal
    ├── SettingsPage
    │   ├── SettingsSidebar
    │   ├── ProfileSettings
    │   ├── AdminUsers
    │   └── AdminIntegrations
    └── LoginPage
        ├── LoginForm
        └── RegisterForm
```

### State Management

Jun-Oro, state management için React Context API ve custom hooks kullanır:

- **AuthContext**: Kullanıcı kimlik doğrulama durumu
- **NavigationContext**: Sayfa navigasyon durumu
- **ActiveSessionContext**: Aktif oyun oturumu bilgileri
- **Custom Hooks**: 
  - `useAuth()`: Authentication işlemleri
  - `useLibrary()`: Kütüphane verileri
  - `useSettings()`: Kullanıcı ayarları
  - `useTutorial()`: Tutorial sistemi

### Veri Akışı

```
User Action → Component → Custom Hook → API Service → Backend
     ↑                                                        ↓
UI Update ← State Update ← Response ← API Response ← Database
```

## 🔧 Backend Mimarisi

### Katmanlı Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Route Layer (Express Router)                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │/api/games   │ │/api/users   │ │/api/library │             │
│  │/api/auth    │ │/api/stats   │ │/api/upload  │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Middleware Layer                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │Auth         │ │Validation   │ │Error        │             │
│  │Rate Limit   │ │Cache       │ │Audit        │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Service Layer                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │GameService  │ │UserService  │ │LibraryService│             │
│  │AuthService  │ │StatsService  │ │UploadService│             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Data Access Layer                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │Prisma Client│ │External APIs │ │Cloudflare R2│             │
│  │             │ │             │ │             │             │
│  │CRUD Ops     │ │IGDB/Steam   │ │File Storage │             │
│  │Relations    │ │Data Fetch   │ │Image Upload │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### API Endpoint Yapısı

```javascript
// Authentication
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me

// Games
GET    /api/games
GET    /api/games/:id
POST   /api/games/search
GET    /api/games/igdb/:id
GET    /api/games/steam/:id

// Library
GET    /api/library
POST   /api/library
PUT    /api/library/:id
DELETE /api/library/:id

// Users
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/stats
```

## 🔄 Veri Akış Diyagramları

### Kullanıcı Girişi Akışı

```
Kullanıcı → Login Form → useAuth Hook → /api/auth/login
    ↓                                                        ↓
Input Validation → JWT Token → Response → AuthContext Update → UI Update
```

### Oyun Ekleme Akışı

```
Kullanıcı → AddGameModal → GameSearch → IGDB API
    ↓                                                        ↓
Game Selection → Form Data → /api/games → Database → Library Update
```

### Oyun Oturumu Akışı

```
Oyun Başlat → useSession Hook → /api/sessions/start
    ↓                                                        ↓
Timer Start → Real-time Update → /api/sessions/end → Database Save
```

## 🎯 Design Pattern'ler

### 1. Repository Pattern
Veritabanı işlemlerini soyutlamak için kullanılır:

```javascript
class GameRepository {
  async findById(id) {
    return await prisma.game.findUnique({ where: { id } });
  }
  
  async create(data) {
    return await prisma.game.create({ data });
  }
}
```

### 2. Factory Pattern
API servisleri oluşturmak için kullanılır:

```javascript
class ApiServiceFactory {
  static create(type) {
    switch(type) {
      case 'igdb': return new IGDBService();
      case 'steam': return new SteamService();
      case 'hltb': return new HLTBService();
    }
  }
}
```

### 3. Observer Pattern
Real-time güncellemeler için kullanılır:

```javascript
class SessionObserver {
  update(sessionData) {
    // UI güncelleme
    this.notifySubscribers(sessionData);
  }
}
```

### 4. Strategy Pattern
Farklı platform entegrasyonları için kullanılır:

```javascript
class PlatformStrategy {
  import() {
    throw new Error('Method must be implemented');
  }
}

class SteamStrategy extends PlatformStrategy {
  import() {
    // Steam özel import mantığı
  }
}
```

## 🔐 Güvenlik Mimarisi

### Authentication & Authorization
- **JWT Token**: Stateless authentication
- **Role-based Access Control**: Admin/User rolleri
- **API Key Management**: External API güvenliği
- **Rate Limiting**: API abuse önleme

### Veri Güvenliği
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Cross-origin security

## 📊 Performans Optimizasyonu

### Frontend Optimizasyonları
- **Code Splitting**: Lazy loading
- **Component Caching**: React.memo
- **Image Optimization**: LazyImage component
- **Bundle Analysis**: Vite analyzer

### Backend Optimizasyonları
- **Database Indexing**: Prisma indexes
- **API Caching**: Redis/memory cache
- **Connection Pooling**: PostgreSQL
- **Compression**: Gzip middleware

## 🔧 Monitoring ve Logging

### Error Handling
- **Centralized Error Handler**: Global error middleware
- **Audit Logging**: Admin action tracking
- **Performance Monitoring**: Response time tracking
- **Health Checks**: Service status monitoring

## 🚀 Ölçeklenebilirlik

### Horizontal Scaling
- **Stateless Design**: Load balancing friendly
- **Database Replication**: Read replicas
- **CDN Integration**: Static asset delivery
- **Microservice Ready**: Modular architecture

### Vertical Scaling
- **Resource Optimization**: Memory/CPU usage
- **Database Optimization**: Query performance
- **Caching Strategy**: Multi-level caching
- **Background Jobs**: Async processing

## 🔮 Gelecek Geliştirmeler

### Planlanan Özellikler
- **Real-time Multiplayer**: WebSocket integration
- **Mobile Application**: React Native
- **AI Recommendations**: Machine learning
- **Social Features**: Friends and sharing

### Teknoloji Yükseltmeleri
- **GraphQL API**: More efficient data fetching
- **Event Sourcing**: Audit trail improvement
- **Microservices**: Service decomposition
- **Container Orchestration**: Kubernetes deployment
# 📚 API Reference

## 📖 Genel Bakış

Jun-Oro RESTful API, oyun kütüphanesi ve yönetim sistemi için HTTP tabanlı bir arayüz sağlar. JSON formatında veri alışverişi yapar ve JWT tabanlı kimlik doğrulaması kullanır.

## 🌐 Base URL

```
Development: http://localhost:3001
Staging: https://staging-api.jun-oro.com
Production: https://api.jun-oro.com
```

## 🔐 Authentication

### JWT Token Authentication

API'ye erişim için JWT token gereklidir. Token'ı `Authorization` header'da gönderin:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Alma

```http
POST /api/users/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440123",
    "username": "testuser",
    "email": "user@example.com",
    "role": "user",
    "status": "active"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440123",
  "expiresIn": "24h"
}
```

## 📋 API Endpoint'leri

### 👤 Users API

#### Tüm Kullanıcıları Getir

```http
GET /api/users?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "username": "testuser",
      "email": "user@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "lastActive": "2023-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### ID ile Kullanıcı Getir

```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440123",
    "username": "testuser",
    "email": "user@example.com",
    "name": "Test User",
    "role": "user",
    "status": "active",
    "profileImage": "https://example.com/avatar.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "lastActive": "2023-01-01T12:00:00.000Z"
  }
}
```

#### Kullanıcı Güncelle

```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com",
  "profileImage": "https://example.com/new-avatar.jpg"
}
```

#### Kullanıcı Kayıt

```http
POST /api/users/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Kullanıcı Özetini Getir

```http
GET /api/users/:id/summary
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "name": "Test User",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "lastActive": "2023-01-01T12:00:00.000Z"
    },
    "library": {
      "totalGames": 25,
      "totalPlaytime": 5000
    },
    "stats": {
      "totalPlayTime": 5000,
      "totalSessions": 100
    },
    "activeSessions": []
  }
}
```

#### Kullanıcı Aktivitesini Güncelle

```http
POST /api/users/:id/activity
Authorization: Bearer <token>
```

#### Kullanıcı Rolünü Güncelle

```http
PUT /api/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

#### Bekleyen Kullanıcıyı Onayla

```http
PUT /api/users/:id/approve
Authorization: Bearer <token>
```

#### Bekleyen Kullanıcıyı Reddet

```http
DELETE /api/users/:id/reject
Authorization: Bearer <token>
```

### 🎮 Games API

#### Oyunları Getir

```http
GET /api/games?page=1&limit=10&search=Action&genre=RPG&platform=PC
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "name": "Test Game",
      "summary": "A test RPG game",
      "genres": [{ "name": "RPG" }, { "name": "Adventure" }],
      "platforms": [{ "name": "PC" }, { "name": "PlayStation" }],
      "rating": 85,
      "category": 0,
      "cover": "https://example.com/cover.jpg",
      "firstReleaseDate": "2023-01-01T00:00:00.000Z",
      "developer": "Test Developer",
      "publishers": ["Test Publisher"],
      "hltbData": {
        "main": 25.5,
        "extra": 10.5,
        "completionist": 30.0
      },
      "metacriticData": {
        "score": 85,
        "url": "https://www.metacritic.com/game/test-game"
      },
      "_count": {
        "libraryEntries": 15,
        "sessions": 42,
        "campaigns": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

#### ID ile Oyun Getir

```http
GET /api/games/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440123",
    "name": "Test Game",
    "summary": "A test RPG game",
    "genres": [{ "name": "RPG" }, { "name": "Adventure" }],
    "platforms": [{ "name": "PC" }, { "name": "PlayStation" }],
    "rating": 85,
    "category": 0,
    "cover": "https://example.com/cover.jpg",
    "firstReleaseDate": "2023-01-01T00:00:00.000Z",
    "developer": "Test Developer",
    "publishers": ["Test Publisher"],
    "steamData": {
      "appId": "12345",
      "url": "https://store.steampowered.com/app/12345"
    },
    "igdbData": {
      "id": "67890",
      "url": "https://www.igdb.com/game/67890"
    },
    "hltbData": {
      "main": 25.5,
      "extra": 10.5,
      "completionist": 30.0
    },
    "metacriticData": {
      "score": 85,
      "url": "https://www.metacritic.com/game/test-game"
    },
    "campaigns": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440123",
        "name": "Main Story",
        "description": "The main campaign",
        "averageDuration": 25.5,
        "isAutoGenerated": false,
        "isMainCampaign": true,
        "difficulty": "medium",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "cachedAt": "2023-01-01T12:00:00.000Z",
    "lastAccessed": "2023-01-01T12:00:00.000Z",
    "accessCount": 42
  }
}
```

#### Oyun Oluştur/Güncelle

```http
POST /api/games
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Game",
  "summary": "A new game description",
  "category": 0,
  "genres": [
    { "name": "Action" }
  ],
  "platforms": [
    { "name": "PC" }
  ],
  "rating": 90,
  "cover": "https://example.com/new-cover.jpg",
  "firstReleaseDate": "2023-01-01T00:00:00.000Z",
  "developer": "New Developer",
  "publishers": ["New Publisher"],
  "steamData": {
    "appId": "54321",
    "url": "https://store.steampowered.com/app/54321"
  }
}
```

#### Oyun Güncelle

```http
PUT /api/games/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Game",
  "summary": "Updated description",
  "rating": 88,
  "cover": "https://example.com/updated-cover.jpg"
}
```

#### Oyun Sil

```http
DELETE /api/games/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Game deleted successfully"
}
```

#### Oyun İstatistikleri

```http
GET /api/games/:id/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440123",
    "name": "Test Game",
    "accessCount": 42,
    "totalInLibraries": 25,
    "totalPlaytime": 5000,
    "averageRating": 8.5,
    "statusDistribution": {
      "playing": 10,
      "completed": 12,
      "backlog": 3
    }
  }
}
```

#### Oyun Arama Önerileri

```http
GET /api/games/search/suggestions?q=Action
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "name": "Action Game 1",
      "summary": "An action game",
      "cover": "https://example.com/action1.jpg",
      "developer": "Action Studio"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440124",
      "name": "Action Game 2",
      "summary": "Another action game",
      "cover": "https://example.com/action2.jpg",
      "developer": "Action Games Inc"
    }
  ]
}
```

#### Toplu Oyun İşlemleri

```http
POST /api/games/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "games": [
    {
      "name": "Game 1",
      "summary": "First game description",
      "category": 0
    },
    {
      "name": "Game 2",
      "summary": "Second game description",
      "category": 1
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "results": [
      {
        "gameId": "game1-id",
        "status": "fulfilled",
        "error": null
      },
      {
        "gameId": "game2-id",
        "status": "fulfilled",
        "error": null
      }
    ]
  },
  "message": "Batch operation completed: 2 successful, 0 failed"
}
```

### 📚 Library API

#### Kullanıcı Kütüphanesi

```http
GET /api/library/:userId?page=1&limit=10&status=playing&search=RPG
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440123",
        "userId": "550e8400-e29b-41d4-a716-446655440123",
        "gameId": "550e8400-e29b-41d4-a716-446655440123",
        "status": "playing",
        "rating": 8,
        "playtime": 1200,
        "notes": "Great game!",
        "addedAt": "2023-01-01T12:00:00.000Z",
        "lastPlayed": "2023-01-01T14:30:00.000Z",
        "game": {
          "id": "550e8400-e29b-41d4-a716-446655440123",
          "name": "Test Game",
          "cover": "https://example.com/cover.jpg",
          "rating": 85,
          "developer": "Test Developer",
          "genres": ["RPG", "Adventure"],
          "platforms": ["PC", "PlayStation"],
          "firstReleaseDate": "2023-01-01T00:00:00.000Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    },
    "stats": {
      "totalGames": 25,
      "totalPlaytime": 5000,
      "lastUpdated": "2023-01-01T12:00:00.000Z"
    }
  }
}
```

#### Kütüphaneye Oyun Ekle

```http
POST /api/library/:userId/games
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameId": "550e8400-e29b-41d4-a716-446655440123",
  "status": "backlog",
  "rating": 0,
  "playtime": 0,
  "notes": "Want to play this game"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440123",
    "userId": "550e8400-e29b-41d4-a716-446655440123",
    "gameId": "550e8400-e29b-41d4-a716-446655440123",
    "status": "backlog",
    "rating": 0,
    "playtime": 0,
    "notes": "Want to play this game",
    "addedAt": "2023-01-01T12:00:00.000Z",
    "game": {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "name": "Test Game",
      "cover": "https://example.com/cover.jpg",
      "rating": 85,
      "developer": "Test Developer"
    }
  },
  "message": "Game added to library successfully"
}
```

#### Kütüphane Girişini Güncelle

```http
PUT /api/library/:userId/games/:gameId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "playing",
  "rating": 9,
  "playtime": 1500,
  "notes": "Really enjoying this game!"
}
```

#### Kütüphaneden Oyun Kaldır

```http
DELETE /api/library/:userId/games/:gameId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Game removed from library successfully"
}
```

#### Kütüphane İstatistikleri

```http
GET /api/library/:userId/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalGames": 25,
    "totalPlaytime": 5000,
    "averageRating": 8.5,
    "categoryDistribution": {
      "playing": 10,
      "completed": 12,
      "backlog": 3
    },
    "genreDistribution": {
      "RPG": 8,
      "Action": 6,
      "Adventure": 5,
      "Strategy": 4,
      "Simulation": 2
    },
    "platformDistribution": {
      "PC": 15,
      "PlayStation": 8,
      "Xbox": 5,
      "Nintendo": 3
    },
    "recentlyAdded": [
      {
        "gameId": "550e8400-e29b-41d4-a716-446655440123",
        "gameName": "New Game",
        "addedAt": "2023-01-01T12:00:00.000Z"
      }
    ],
    "recentlyPlayed": [
      {
        "gameId": "550e8400-e29b-41d4-a716-446655440123",
        "gameName": "Current Game",
        "lastPlayed": "2023-01-01T14:30:00.000Z",
        "playtime": 120
      }
    ]
  }
}
```

#### Kütüphane İçe Aktar

```http
POST /api/library/:userId/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "entries": [
    {
      "gameId": "550e8400-e29b-41d4-a716-446655440123",
      "status": "backlog",
      "rating": 0,
      "playtime": 0,
      "notes": "Imported game 1"
    },
    {
      "gameId": "550e8400-e29b-41d4-a716-446655440124",
      "status": "completed",
      "rating": 9,
      "playtime": 2500,
      "notes": "Imported game 2"
    }
  ]
}
```

### ⏱️ Sessions API

#### Kullanıcı Oturumları

```http
GET /api/sessions/:userId?active=true
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "userId": "550e8400-e29b-41d4-a716-446655440123",
      "gameId": "550e8400-e29b-41d4-a716-446655440123",
      "campaignId": "550e8400-e29b-41d4-a716-446655440123",
      "startTime": "2023-01-01T12:00:00.000Z",
      "endTime": null,
      "playtime": 0,
      "isActive": true,
      "notes": "Playing main campaign",
      "game": {
        "id": "550e8400-e29b-41d4-a716-446655440123",
        "name": "Test Game",
        "cover": "https://example.com/cover.jpg"
      }
    }
  ]
}
```

#### Yeni Oturum Oluştur

```http
POST /api/sessions/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameId": "550e8400-e29b-41d4-a716-446655440123",
  "campaignId": "550e8400-e29b-41d4-a716-446655440123",
  "startTime": "2023-01-01T12:00:00.000Z",
  "notes": "Starting new session"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440123",
    "userId": "550e8400-e29b-41d4-a716-446655440123",
    "gameId": "550e8400-e29b-41d4-a716-446655440123",
    "campaignId": "550e8400-e29b-41d4-a716-446655440123",
    "startTime": "2023-01-01T12:00:00.000Z",
    "endTime": null,
    "playtime": 0,
    "isActive": true,
    "notes": "Starting new session",
    "game": {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "name": "Test Game",
      "cover": "https://example.com/cover.jpg"
    }
  },
  "message": "Session started successfully"
}
```

#### Oturum Güncelle

```http
PUT /api/sessions/:sessionId
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Updated session notes",
  "playtime": 120
}
```

#### Oturumu Bitir

```http
POST /api/sessions/:sessionId/end
Authorization: Bearer <token>
Content-Type: application/json

{
  "endTime": "2023-01-01T16:30:00.000Z",
  "playtime": 270
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440123",
    "userId": "550e8400-e29b-41d4-a716-446655440123",
    "gameId": "550e8400-e29b-41d4-a716-446655440123",
    "startTime": "2023-01-01T12:00:00.000Z",
    "endTime": "2023-01-01T16:30:00.000Z",
    "playtime": 270,
    "isActive": false,
    "game": {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "name": "Test Game",
      "cover": "https://example.com/cover.jpg"
    },
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "username": "testuser"
    }
  },
  "message": "Session ended successfully"
}
```

#### Oturum Geçmişi

```http
GET /api/sessions/:userId/history?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "userId": "550e8400-e29b-41d4-a716-446655440123",
      "gameId": "550e8400-e29b-41d4-a716-446655440123",
      "startTime": "2023-01-01T12:00:00.000Z",
      "endTime": "2023-01-01T16:30:00.000Z",
      "playtime": 270,
      "isActive": false,
      "game": {
        "id": "550e8400-e29b-41d4-a716-446655440123",
        "name": "Test Game",
        "cover": "https://example.com/cover.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### Oturum Sil

```http
DELETE /api/sessions/:sessionId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

### 🏆 Campaigns API

#### Oyun Kampanyaları

```http
GET /api/campaigns?gameId=550e8400-e29b-41d4-a716-446655440123
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440123",
      "gameId": "550e8400-e29b-41d4-a716-446655440123",
      "name": "Main Story",
      "description": "The main campaign",
      "averageDuration": 25.5,
      "isAutoGenerated": false,
      "isMainCampaign": true,
      "difficulty": "medium",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440124",
      "gameId": "550e8400-e29b-41d4-a716-446655440123",
      "name": "Side Quests",
      "description": "Additional content",
      "averageDuration": 15.0,
      "isAutoGenerated": true,
      "isMainCampaign": false,
      "difficulty": "easy",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Kampanya Oluştur

```http
POST /api/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameId": "550e8400-e29b-41d4-a716-446655440123",
  "name": "Main Story",
  "description": "The main campaign",
  "averageDuration": 25.5,
  "isAutoGenerated": false,
  "isMainCampaign": true,
  "difficulty": "medium"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440123",
    "gameId": "550e8400-e29b-41d4-a716-446655440123",
    "name": "Main Story",
    "description": "The main campaign",
    "averageDuration": 25.5,
    "isAutoGenerated": false,
    "isMainCampaign": true,
    "difficulty": "medium",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Campaign created successfully"
}
```

## 📊 Statistics API

#### Kullanıcı İstatistikleri

```http
GET /api/stats/:userId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalGames": 25,
    "totalPlaytime": 5000,
    "totalSessions": 100,
    "averageSessionLength": 50,
    "completionRate": 0.48,
    "favoriteGenre": "RPG",
    "favoritePlatform": "PC",
    "monthlyStats": [
      {
        "month": "2023-01",
        "playtime": 1200,
        "sessions": 25,
        "gamesPlayed": 8
      }
    ],
    "genreDistribution": {
      "RPG": 8,
      "Action": 6,
      "Adventure": 5
    },
    "platformDistribution": {
      "PC": 15,
      "PlayStation": 8,
      "Xbox": 5
    }
  }
}
```

#### Genel İstatistikler

```http
GET /api/stats/overview
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "totalGames": 5000,
    "totalPlaytime": 250000,
    "totalSessions": 10000,
    "popularGames": [
      {
        "gameId": "550e8400-e29b-41d4-a716-446655440123",
        "gameName": "Popular Game",
        "playtime": 50000,
        "libraryCount": 500
      }
    ],
    "popularGenres": [
      {
        "genre": "RPG",
        "count": 1500
      },
      {
        "genre": "Action",
        "count": 1200
      }
    ]
  }
}
```

## 🚨 Error Responses

Tüm API endpoint'leri standart error formatı kullanır:

### Validation Error (400)

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data"
}
```

### Authentication Error (401)

```json
{
  "success": false,
  "error": "AUTHENTICATION_ERROR",
  "message": "Invalid or expired token"
}
```

### Authorization Error (403)

```json
{
  "success": false,
  "error": "AUTHORIZATION_ERROR",
  "message": "Insufficient permissions"
}
```

### Not Found Error (404)

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### Rate Limit Error (429)

```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests, please try again later"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred"
}
```

## ⏱️ Rate Limiting

API endpoint'leri rate limiting'e tabidir:

- **Window**: 15 dakika
- **Max Requests**: 100 IP başına
- **Headers**: Rate limit bilgileri header'larda döner

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📄 Pagination

List endpoint'leri pagination destekler:

### Query Parameters

- `page`: Sayfa numarası (default: 1)
- `limit`: Sayfa başına öğe sayısı (default: 10, max: 100)

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

## 🔍 Search and Filtering

### Games Search

```http
GET /api/games?search=Action&genre=RPG&platform=PC&rating_min=80&rating_max=100
```

### Library Filtering

```http
GET /api/library/:userId?status=playing&rating_min=7&playtime_min=60
```

### Sessions Filtering

```http
GET /api/sessions/:userId?active=true&date_from=2023-01-01&date_to=2023-01-31
```

## 📁 File Upload

### Image Upload

```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image-file>
type: avatar|game_cover|screenshot
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://example.com/uploads/avatar.jpg",
    "filename": "avatar.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

## 🪝 Webhooks

### Game Data Updates

External servislerden gelen veri için webhook endpoint'leri:

```http
POST /api/webhooks/steam/update
Content-Type: application/json

{
  "appId": "12345",
  "data": {
    "name": "Updated Game Name",
    "price": "19.99",
    "updated_at": "2023-01-01T12:00:00.000Z"
  }
}
```

```http
POST /api/webhooks/igdb/update
Content-Type: application/json

{
  "igdbId": "67890",
  "data": {
    "name": "Updated Game Name",
    "rating": 85,
    "updated_at": "2023-01-01T12:00:00.000Z"
  }
}
```

## 📚 SDK ve Client Libraries

### JavaScript/TypeScript

```bash
npm install @jun-oro/api-client
```

```javascript
import { JunOroAPI } from "@jun-oro/api-client";

const api = new JunOroAPI({
  baseURL: "http://localhost:3001",
  token: "your-jwt-token",
});

// Kullanım örneği
const games = await api.games.list({ page: 1, limit: 10 });
const game = await api.games.get("game-id");
const library = await api.library.getUserLibrary("user-id");
const session = await api.sessions.create("user-id", {
  gameId: "game-id",
  notes: "Starting new session",
});
```

### Python

```bash
pip install jun-oro-api
```

```python
from jun_oro_api import JunOroAPI

api = JunOroAPI(
    base_url='http://localhost:3001',
    token='your-jwt-token'
)

# Kullanım örneği
games = api.games.list(page=1, limit=10)
game = api.games.get('game-id')
library = api.library.get_user_library('user-id')
session = api.sessions.create('user-id', {
    'game_id': 'game-id',
    'notes': 'Starting new session'
})
```

## 🧪 Testing

API testleri için Swagger UI kullanabilirsiniz:

```
http://localhost:3001/api-docs
```

Veya curl ile test:

```bash
# Health check
curl http://localhost:3001/health

# Authentication
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Authenticated request
curl -X GET http://localhost:3001/api/games \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📈 Versioning

API versiyonu semantik versioning kullanır:

- **Major**: Breaking changes (2.0.0)
- **Minor**: New features (1.1.0)
- **Patch**: Bug fixes (1.1.1)

Versiyon bilgisi header'larda döner:

```http
API-Version: 1.0.0
```

## 🔗 İlgili Sayfalar

- [Home](Home.md) - Wiki ana sayfası
- [Getting Started](Getting-Started.md) - Hızlı başlangıç rehberi
- [Developer Guide](Developer-Guide.md) - Geliştirici rehberi
- [Database Schema](Database-Schema.md) - Veritabanı şeması
- [Deployment](Deployment.md) - Deployment rehberi
- [Troubleshooting](Troubleshooting.md) - Sorun giderme

## 📞 Destek

### Documentation

- [Swagger UI](http://localhost:3001/api-docs)
- [Developer Guide](Developer-Guide.md)
- [Database Schema](Database-Schema.md)

### Contact

- **API Support**: api-support@jun-oro.com
- **Documentation Issues**: docs@jun-oro.com
- **Bug Reports**: bugs@jun-oro.com

---

**Not**: Bu API reference dokümantasyonu sürekli olarak güncellenmektedir. Yeni endpoint'ler veya değişiklikler için docs/ klasörünü kontrol edin.

---

_Son güncelleme: 10 Ocak 2025_

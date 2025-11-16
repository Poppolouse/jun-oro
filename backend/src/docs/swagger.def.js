/**
 * @fileoverview Swagger API definition
 * @description OpenAPI 3.0 specification for Jun-Oro API
 */

/**
 * OpenAPI 3.0 specification
 */
export const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Jun-Oro API",
    description: "Oyun kütüphanesi ve yönetim sistemi için API",
    version: "1.0.0",
    contact: {
      name: "Jun-Oro Team",
      email: "support@jun-oro.com",
      url: "https://jun-oro.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "https://api.jun-oro.com/api",
      description: "Production API Server",
    },
  ],
  components: {
    schemas: {
      User: {
        type: "object",
        required: ["id", "username", "email", "role", "status"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Kullanıcı benzersiz kimliği",
            example: "550e8400-e29b-41d4-a716-446655440123",
          },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 50,
            pattern: "^[a-zA-Z0-9_-]+$",
            description: "Kullanıcı adı",
            example: "testuser",
          },
          email: {
            type: "string",
            format: "email",
            description: "E-posta adresi",
            example: "user@example.com",
          },
          name: {
            type: "string",
            description: "Kullanıcının tam adı",
            example: "Test User",
          },
          role: {
            type: "string",
            enum: ["user", "admin"],
            description: "Kullanıcı rolü",
            example: "user",
          },
          status: {
            type: "string",
            enum: ["active", "pending", "suspended", "banned"],
            description: "Kullanıcı durumu",
            example: "active",
          },
          profileImage: {
            type: "string",
            format: "uri",
            description: "Profil resmi URL",
            example: "https://example.com/avatar.jpg",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Hesap oluşturulma tarihi",
            example: "2023-01-01T00:00:00.000Z",
          },
          lastActive: {
            type: "string",
            format: "date-time",
            description: "Son aktiflik tarihi",
            example: "2023-01-01T12:00:00.000Z",
          },
        },
      },
      Game: {
        type: "object",
        required: ["id", "name", "summary", "category"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Oyun benzersiz kimliği",
            example: "550e8400-e29b-41d4-a716-446655440123",
          },
          name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
            description: "Oyun adı",
            example: "Test Game",
          },
          summary: {
            type: "string",
            maxLength: 1000,
            description: "Oyun açıklaması",
            example: "Test oyunu için açıklama",
          },
          genres: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Tür adı",
                  example: "Action",
                },
              },
            },
            description: "Oyun türleri",
            example: [{ name: "Action" }, { name: "RPG" }],
          },
          platforms: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Platform adı",
                  example: "PC",
                },
              },
            },
            description: "Oyun platformları",
            example: [{ name: "PC" }, { name: "PlayStation" }],
          },
          rating: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "Oyun puanı (0-100)",
            example: 85,
          },
          category: {
            type: "integer",
            enum: [0, 1, 2],
            description: "Oyun kategorisi (0: Ana oyun, 1: DLC, 2: Expansion)",
            example: 0,
          },
          cover: {
            type: "string",
            format: "uri",
            description: "Oyun kapak resmi URL",
            example: "https://example.com/cover.jpg",
          },
          firstReleaseDate: {
            type: "string",
            format: "date-time",
            description: "İlk yayınlanma tarihi",
            example: "2023-01-01T00:00:00.000Z",
          },
          developer: {
            type: "string",
            description: "Geliştirici",
            example: "Test Developer",
          },
          publishers: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Yayıncılar",
            example: ["Test Publisher"],
          },
          steamData: {
            type: "object",
            description: "Steam verileri",
            properties: {
              appId: {
                type: "string",
                description: "Steam uygulama ID",
                example: "12345",
              },
              url: {
                type: "string",
                format: "uri",
                description: "Steam mağaza URL",
                example: "https://store.steampowered.com/app/12345",
              },
            },
          },
          igdbData: {
            type: "object",
            description: "IGDB verileri",
            properties: {
              id: {
                type: "string",
                description: "IGDB oyun ID",
                example: "67890",
              },
              url: {
                type: "string",
                format: "uri",
                description: "IGDB URL",
                example: "https://www.igdb.com/game/67890",
              },
            },
          },
          hltbData: {
            type: "object",
            description: "HowLongToBeat verileri",
            properties: {
              main: {
                type: "number",
                description: "Ana hikaye süresi (saat)",
                example: 25.5,
              },
              extra: {
                type: "number",
                description: "Ek içerik süresi (saat)",
                example: 10.5,
              },
              completionist: {
                type: "number",
                description: "Tamamlama süresi (saat)",
                example: 30.0,
              },
            },
          },
          metacriticData: {
            type: "object",
            description: "Metacritic verileri",
            properties: {
              score: {
                type: "integer",
                minimum: 0,
                maximum: 100,
                description: "Metacritic puanı",
                example: 85,
              },
              url: {
                type: "string",
                format: "uri",
                description: "Metacritic URL",
                example: "https://www.metacritic.com/game/test-game",
              },
            },
          },
          cachedAt: {
            type: "string",
            format: "date-time",
            description: "Veri önbelleğe alındığı tarih",
            example: "2023-01-01T12:00:00.000Z",
          },
          lastAccessed: {
            type: "string",
            format: "date-time",
            description: "Son erişim tarihi",
            example: "2023-01-01T12:00:00.000Z",
          },
          accessCount: {
            type: "integer",
            minimum: 0,
            description: "Erişim sayısı",
            example: 42,
          },
        },
      },
      LibraryEntry: {
        type: "object",
        required: ["id", "userId", "gameId", "status"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Kütüphane kaydı benzersiz kimliği",
            example: "550e8400-e29b-41d4-a716-446655440123",
          },
          userId: {
            type: "string",
            format: "uuid",
            description: "Kullanıcı kimliği",
            example: "550e8400-e29b-41d4-a716-446655440123",
          },
          gameId: {
            type: "string",
            format: "uuid",
            description: "Oyun kimliği",
            example: "550e8400-e29b-41d4-a716-446655440123",
          },
          status: {
            type: "string",
            enum: ["backlog", "playing", "completed", "paused", "abandoned"],
            description: "Oyun durumu",
            example: "playing",
          },
          rating: {
            type: "integer",
            minimum: 0,
            maximum: 10,
            description: "Kullanıcı puanı (0-10)",
            example: 8,
          },
          playtime: {
            type: "integer",
            minimum: 0,
            description: "Oynama süresi (dakika)",
            example: 1200,
          },
          notes: {
            type: "string",
            maxLength: 1000,
            description: "Kullanıcı notları",
            example: "Harika bir oyun!",
          },
          addedAt: {
            type: "string",
            format: "date-time",
            description: "Kütüphaneye eklendiği tarih",
            example: "2023-01-01T12:00:00.000Z",
          },
          lastPlayed: {
            type: "string",
            format: "date-time",
            description: "Son oynama tarihi",
            example: "2023-01-01T12:00:00.000Z",
          },
          completedAt: {
            type: "string",
            format: "date-time",
            description: "Tamamlama tarihi",
            example: "2023-01-01T12:00:00.000Z",
          },
        },
      },
      Error: {
        type: "object",
        required: ["success", "error", "message"],
        properties: {
          success: {
            type: "boolean",
            description: "İşlem başarılı mı?",
            example: false,
          },
          error: {
            type: "string",
            description: "Hata kodu",
            example: "VALIDATION_ERROR",
          },
          message: {
            type: "string",
            description: "Hata mesajı",
            example: "Geçersiz giriş bilgileri",
          },
        },
      },
      PaginatedResponse: {
        type: "object",
        required: ["success", "data", "pagination"],
        properties: {
          success: {
            type: "boolean",
            description: "İşlem başarılı mı?",
            example: true,
          },
          data: {
            type: "array",
            description: "Veri listesi",
            items: {
              type: "object",
            },
          },
          pagination: {
            type: "object",
            required: ["page", "limit", "total", "pages"],
            properties: {
              page: {
                type: "integer",
                minimum: 1,
                description: "Mevcut sayfa",
                example: 1,
              },
              limit: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                description: "Sayfa başına öğe sayısı",
                example: 20,
              },
              total: {
                type: "integer",
                minimum: 0,
                description: "Toplam öğe sayısı",
                example: 150,
              },
              pages: {
                type: "integer",
                minimum: 0,
                description: "Toplam sayfa sayısı",
                example: 8,
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/users": {
      get: {
        summary: "Tüm kullanıcıları listele",
        description: "Kullanıcı listesi sayfalama ile döner",
        tags: ["Users"],
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Sayfa numarası",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Sayfa başına öğe sayısı",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        ],
        responses: {
          200: {
            description: "Başarılı",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedResponse",
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Yeni kullanıcı oluştur",
        description: "Yeni kullanıcı hesabı oluşturur",
        tags: ["Users"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Kullanıcı başarıyla oluşturuldu",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          400: {
            description: "Geçersiz giriş bilgileri",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        summary: "Kullanıcı bilgilerini getir",
        description: "Belirtilen kullanıcının detaylı bilgilerini döner",
        tags: ["Users"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Kullanıcı kimliği",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "Kullanıcı bilgileri",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          404: {
            description: "Kullanıcı bulunamadı",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      put: {
        summary: "Kullanıcı bilgilerini güncelle",
        description: "Belirtilen kullanıcının bilgilerini günceller",
        tags: ["Users"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Kullanıcı kimliği",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Kullanıcı başarıyla güncellendi",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          404: {
            description: "Kullanıcı bulunamadı",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/users/login": {
      post: {
        summary: "Kullanıcı girişi",
        description: "Kullanıcı adı ve şifre ile giriş yapar",
        tags: ["Authentication"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: {
                    type: "string",
                    description: "Kullanıcı adı veya e-posta",
                    example: "testuser",
                  },
                  password: {
                    type: "string",
                    description: "Şifre",
                    example: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Başarılı giriş",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      $ref: "#/components/schemas/User",
                    },
                    token: {
                      type: "string",
                      description: "JWT token",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    sessionId: {
                      type: "string",
                      description: "Oturum ID",
                      example: "550e8400-e29b-41d4-a716-446655440123",
                    },
                    expiresIn: {
                      type: "string",
                      description: "Token geçerlilik süresi",
                      example: "24h",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Geçersiz giriş bilgileri",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/games": {
      get: {
        summary: "Oyunları listele",
        description: "Oyun listesi sayfalama ile döner",
        tags: ["Games"],
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Sayfa numarası",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Sayfa başına öğe sayısı",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
          {
            name: "search",
            in: "query",
            description: "Arama terimi",
            schema: {
              type: "string",
              example: "Action",
            },
          },
        ],
        responses: {
          200: {
            description: "Oyun listesi",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/games/{id}": {
      get: {
        summary: "Oyun detaylarını getir",
        description: "Belirtilen oyunun detaylı bilgilerini döner",
        tags: ["Games"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Oyun kimliği",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "Oyun detayları",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Game",
                },
              },
            },
          },
          404: {
            description: "Oyun bulunamadı",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/library/{userId}": {
      get: {
        summary: "Kullanıcı kütüphanesini getir",
        description: "Kullanıcının oyun kütüphanesini döner",
        tags: ["Library"],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            description: "Kullanıcı kimliği",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
          {
            name: "page",
            in: "query",
            description: "Sayfa numarası",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Sayfa başına öğe sayısı",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        ],
        responses: {
          200: {
            description: "Kütüphane",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/LibraryEntry",
                      },
                    },
                    pagination: {
                      $ref: "#/components/schemas/PaginatedResponse/properties/pagination",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token ile kimlik doğrulaması",
      },
    },
  ],
};

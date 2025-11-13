# 🚀 Deployment Rehberi

## 📋 Genel Bakış

Bu rehber, Jun-Oro gaming platformunu development ve production ortamlarına nasıl dağıtacağınızı adım adım açıklar. Platform, frontend (React + Vite) ve backend (Node.js + Express) bileşenlerinden oluşur ve PostgreSQL veritabanı ile Cloudflare R2 depolama kullanır.

## 🛠️ Development Ortamı Kurulumu

### Ön Gereksinimler

- **Node.js** 18+
- **PostgreSQL** 14+
- **Git**
- **VS Code** (tavsiye edilen)

### 1. Projeyi Klonlama

```bash
git clone https://github.com/Poppolouse/jun-oro.git
cd jun-oro
```

### 2. Frontend Kurulumu

```bash
# Ana dizinde
npm install

# Environment dosyası oluştur
cp .env.example .env
```

#### Frontend Environment Değişkenleri

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# External API URLs
VITE_IGDB_BASE_URL=https://api.igdb.com/v4
VITE_STEAM_BASE_URL=https://store.steampowered.com/api
```

### 3. Backend Kurulumu

```bash
# Backend dizinine geç
cd backend

# Bağımlılıkları yükle
npm install

# Environment dosyası oluştur
cp .env.example .env
```

#### Backend Environment Değişkenleri

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/jun_oro_dev

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# External API Keys
IGDB_CLIENT_ID=your-igdb-client-id
IGDB_CLIENT_SECRET=your-igdb-client-secret
STEAM_API_KEY=your-steam-api-key
HLTB_API_KEY=your-hltb-api-key

# Cloudflare R2
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=jun-oro-assets
R2_PUBLIC_URL=https://your-r2-domain.com

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Veritabanı Kurulumu

```bash
# PostgreSQL servisini başlat
sudo systemctl start postgresql

# Veritabanı ve kullanıcı oluştur
sudo -u postgres psql
CREATE DATABASE jun_oro_dev;
CREATE USER jun_oro_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jun_oro_dev TO jun_oro_user;
\q

# Migration'ları çalıştır
cd backend
npm run db:migrate
npm run db:generate
```

### 5. Development Sunucularını Başlatma

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Uygulamalar şu adreslerde çalışacaktır:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Dokümantasyonu: http://localhost:3000/api-docs

## 🚀 Production Ortamı Dağıtımı

### Platform Seçenekleri

#### 1. VPS (DigitalOcean, Vultr, Linode)

#### 2. PaaS (Heroku, Railway, Render)

#### 3. Container (Docker + Kubernetes)

#### 4. Serverless (Vercel + Cloudflare Workers)

### VPS Deployment (Örnek: Ubuntu 22.04)

#### 1. Sunucu Hazırlığı

```bash
# Sistemi güncelle
sudo apt update && sudo apt upgrade -y

# Gerekli paketleri kur
sudo apt install -y curl wget git nginx postgresql postgresql-contrib

# Node.js 18 kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kur (process manager)
sudo npm install -g pm2

# Firewall yapılandır
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### 2. PostgreSQL Kurulumu

```bash
# PostgreSQL kur ve yapılandır
sudo apt install -y postgresql postgresql-contrib

# Veritabanı oluştur
sudo -u postgres psql
CREATE DATABASE jun_oro_prod;
CREATE USER jun_oro_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE jun_oro_prod TO jun_oro_user;
\q

# PostgreSQL güvenliği
sudo nano /etc/postgresql/14/main/postgresql.conf
# listen_addresses = 'localhost'改为 listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

#### 3. Uygulama Dağıtımı

```bash
# Repo'yu klonla
cd /var/www
git clone https://github.com/Poppolouse/jun-oro.git
cd jun-oro

# Frontend build
npm install
npm run build

# Backend build
cd backend
npm install --production
npm run db:migrate:deploy
npm run db:generate
```

#### 4. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "jun-oro-backend",
      script: "./backend/src/index.js",
      cwd: "/var/www/jun-oro",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      log_file: "./logs/backend-combined.log",
      time: true,
    },
  ],
};
```

```bash
# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/jun-oro
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend static files
    location / {
        root /var/www/jun-oro/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Site'ı aktifleştir
sudo ln -s /etc/nginx/sites-available/jun-oro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kur
sudo apt install -y certbot python3-certbot-nginx

# Sertifika al
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Otomatik yenileme
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Docker Deployment

#### 1. Dockerfile (Frontend)

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Dockerfile (Backend)

```dockerfile
# Dockerfile.backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run db:generate

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

#### 3. Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: jun_oro
      POSTGRES_USER: jun_oro_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      DATABASE_URL: postgresql://jun_oro_user:${DB_PASSWORD}@postgres:5432/jun_oro
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    ports:
      - "3000:3000"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

```bash
# Docker ile dağıtım
docker-compose up -d --build
```

### PaaS Deployment (Railway)

#### 1. Railway CLI Kurulumu

```bash
# Railway CLI kur
npm install -g @railway/cli

# Login yap
railway login
```

#### 2. Project Oluşturma

```bash
# Project oluştur
railway init

# PostgreSQL ekle
railway add postgresql

# Backend deploy
cd backend
railway up

# Frontend deploy
cd ..
railway up
```

#### 3. Environment Variables

```bash
# Environment değişkenlerini ayarla
railway variables set JWT_SECRET=your-jwt-secret
railway variables set IGDB_CLIENT_ID=your-igdb-id
railway variables set IGDB_CLIENT_SECRET=your-igdb-secret
# ... diğer değişkenler
```

## 🔧 Environment Variable'ler ve Konfigürasyon

### Zorunlu Değişkenler

| Değişken       | Açıklama                     | Örnek                                 |
| -------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL` | PostgreSQL bağlantı string'i | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET`   | JWT token imzalama anahtarı  | `super-secret-key-123`                |
| `NODE_ENV`     | Ortam tipi                   | `development`, `production`           |
| `PORT`         | Backend port numarası        | `3000`                                |

### External API Değişkenleri

| Değişken             | Açıklama                   | Gerekli      |
| -------------------- | -------------------------- | ------------ |
| `IGDB_CLIENT_ID`     | IGDB API client ID         | Evet         |
| `IGDB_CLIENT_SECRET` | IGDB API client secret     | Evet         |
| `STEAM_API_KEY`      | Steam API anahtarı         | İsteğe bağlı |
| `HLTB_API_KEY`       | HowLongToBeat API anahtarı | İsteğe bağlı |

### Cloudflare R2 Değişkenleri

| Değişken               | Açıklama               | Örnek                        |
| ---------------------- | ---------------------- | ---------------------------- |
| `R2_ACCOUNT_ID`        | Cloudflare hesap ID'si | `1234567890abcdef`           |
| `R2_ACCESS_KEY_ID`     | R2 erişim anahtarı     | `access-key-id`              |
| `R2_SECRET_ACCESS_KEY` | R2 gizli anahtar       | `secret-access-key`          |
| `R2_BUCKET_NAME`       | R2 bucket adı          | `jun-oro-assets`             |
| `R2_PUBLIC_URL`        | R2 public URL          | `https://assets.jun-oro.com` |

## 🔄 Build ve Deployment Süreçleri

### Frontend Build Süreci

```bash
# Development build
npm run build

# Production build
NODE_ENV=production npm run build

# Build analizi
npm run build -- --analyze
```

### Backend Build Süreci

```bash
# Dependencies kurulumu
npm ci --only=production

# Database migration
npm run db:migrate:deploy

# Prisma client generate
npm run db:generate
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci

      - name: Run tests
        run: |
          npm run test
          cd backend && npm run test

      - name: Build application
        run: |
          npm run build
          cd backend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/jun-oro
            git pull origin main
            npm install
            npm run build
            cd backend
            npm install --production
            npm run db:migrate:deploy
            pm2 restart jun-oro-backend
```

## 🐳 Docker Kullanımı

### Geliştirme için Docker

```bash
# Development container'ı başlat
docker-compose -f docker-compose.dev.yml up

# Container'ı durdur
docker-compose -f docker-compose.dev.yml down

# Logları izle
docker-compose logs -f backend
```

### Production için Docker

```bash
# Production build
docker-compose -f docker-compose.prod.yml build

# Production deploy
docker-compose -f docker-compose.prod.yml up -d

# Container'ları güncelle
docker-compose pull && docker-compose up -d
```

### Docker Optimizasyonları

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
# ... build steps

FROM node:18-alpine AS production
# ... production steps

# Security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## ☁️ Cloudflare R2 Entegrasyonu

### R2 Bucket Oluşturma

```bash
# Wrangler CLI kur
npm install -g wrangler

# Login yap
wrangler login

# Bucket oluştur
wrangler r2 bucket create jun-oro-assets

# Bucket listele
wrangler r2 bucket list
```

### File Upload Implementation

```javascript
// backend/src/lib/cloudflareR2.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadToR2(file, key) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2Client.send(command);

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
```

### Public Access Ayarları

```bash
# Custom domain ayarla
wrangler r2 bucket configure jun-oro-assets --public-url=https://assets.jun-oro.com

# CORS ayarları
wrangler r2 bucket put-cors jun-oro-assets --cors-configuration='
  {
    "AllowedOrigins": ["https://jun-oro.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"]
  }
'
```

## 🔍 Monitoring ve Debugging

### Health Check Endpoint

```javascript
// backend/src/routes/health.js
app.get("/health", async (req, res) => {
  try {
    // Database bağlantısı kontrolü
    await prisma.$queryRaw`SELECT 1`;

    // External API'ler kontrolü
    const igdbStatus = await checkIGDBHealth();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        igdb: igdbStatus,
        r2: "connected",
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});
```

### Log Management

```bash
# PM2 logları
pm2 logs jun-oro-backend

# Nginx logları
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logları
sudo journalctl -u nginx -f
```

### Performance Monitoring

```javascript
// Performance middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
});
```

## 🚨 Troubleshooting

### Yaygın Sorunlar

#### 1. Database Connection Error

```bash
# PostgreSQL durumunu kontrol et
sudo systemctl status postgresql

# Connection test
psql -h localhost -U jun_oro_user -d jun_oro_prod

# Port kontrolü
sudo netstat -tlnp | grep 5432
```

#### 2. Port Already in Use

```bash
# Port kullanan process'i bul
sudo lsof -i :3000

# Process'i sonlandır
sudo kill -9 <PID>
```

#### 3. Permission Errors

```bash
# Dosya izinlerini düzelt
sudo chown -R www-data:www-data /var/www/jun-oro
sudo chmod -R 755 /var/www/jun-oro
```

#### 4. SSL Certificate Issues

```bash
# Sertifika durumunu kontrol et
sudo certbot certificates

# Sertifikayı yenile
sudo certbot renew --dry-run

# Nginx configuration test
sudo nginx -t
```

### Debug Mode

```bash
# Backend debug modu
DEBUG=* npm run dev

# Frontend debug modu
VITE_ENABLE_DEBUG=true npm run dev
```

## 📈 Performance Optimizasyonu

### Frontend Optimizasyonu

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
};
```

### Backend Optimizasyonu

```javascript
// Connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

// Compression middleware
app.use(compression());
```

### Nginx Optimizasyonu

```nginx
# gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔮 Gelecek Geliştirmeler

### Otomatik Scaling

- **Horizontal Pod Autoscaler**: Kubernetes için
- **Load Balancer**: Multi-instance deployment
- **CDN Integration**: Global content delivery

### Monitoring ve Alerting

- **Prometheus + Grafana**: Metrics collection
- **ELK Stack**: Log aggregation
- **Uptime Monitoring**: Service availability

### Security İyileştirmeleri

- **Rate Limiting**: API abuse prevention
- **WAF**: Web Application Firewall
- **Security Headers**: HTTP security headers
- **Dependency Scanning**: Vulnerability detection

---

## 🧭 Navigasyon

- [← Ana Sayfa](Home.md)
- [↑ Geliştirici Rehberi](Developer-Guide.md)
- [→ Veritabanı Şeması](Database-Schema.md)
- [API Referansı](API-Reference.md)

## 🔗 İlgili Sayfalar

- [Getting Started](Getting-Started.md)
- [User Guide](User-Guide.md)
- [Library Management](Library-Management.md)
- [Session Tracking](Session-Tracking.md)
- [Troubleshooting](Troubleshooting.md)

---

**Etiketler:** `deployment` `production` `docker` `nginx` `ssl` `monitoring` `performance`

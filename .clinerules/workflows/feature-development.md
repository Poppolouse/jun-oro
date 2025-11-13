# Feature Development Workflow

## Trigger

Yeni feature isteği geldiğinde

## Steps

### 1. Task Parçalama

- Büyük task'ı mantıksal parçalara böl
- Her parça 5-10 dakika olsun
- Tüm adımları listele
- Tahmini süreleri belirt

### 2. Database (Varsa)

- prisma/schema.prisma kontrol et
- Model gerekli mi?
- Model ekle/güncelle
- Migration talimatı ver
- Checkpoint

### 3. API Endpoints (Backend gerekirse)

- .env config kontrolü
- Eksik değişken varsa iste
- Route/controller yaz
- Validation ekle (Zod)
- Error handling
- Checkpoint

### 4. Tasarım (UI gerekirse)

→ `design-workflow.md` çalıştır

### 5. Frontend Implementation

- Component'leri oluştur
- State management (Zustand)
- API integration
- ERS kodlarını ekle
- Checkpoint

### 6. Testing

- Kullanıcı test etsin (npm run dev)
- Hata varsa düzelt
- Onay al

### 7. Dokümantasyon

→ `documentation-workflow.md` çalıştır

### 8. Progress Tracking

- Markdown checklist oluştur
- Her adımda güncelle
- Timestamp ekle

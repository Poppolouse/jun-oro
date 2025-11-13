# Jun-Oro Project Rules

## 🎯 Çalışma Prensibi: İteratif Geliştirme

### Varsayım Yapma (Assumption Gate)

**Her zaman sor:**

- Config/credentials (Database URL, API keys)
- Dil sayısı (1 mi, çoklu mu?)
- Belirsiz tasarım kararları
- Platform seçimleri
- Feature scope belirsizse

**Sorma (dokümanlarda var):**

- DESIGN-SYSTEM.md'de tanımlı değerler
- DESIGN-PREFERENCES.md'de kayıtlı tercihler
- Mevcut pattern'ler ve conventions

---

## 📚 Context Loading

### Her session başında otomatik oku:

- docs/DESIGN-SYSTEM.md
- docs/DESIGN-PREFERENCES.md
- docs/CODING-STANDARDS.md
- docs/ERS-REGISTRY.md
- prisma/schema.prisma
- package.json

### İhtiyaç olursa oku:

- Benzer component'ler (tasarım tutarlılığı için)
- Mevcut API routes (yeni endpoint eklerken)
- İlgili utility fonksiyonlar

---

## 📏 Coding Standards

### Dosya ve Fonksiyon Boyutları

- **Dosya:** Max 300 satır (ideal), 500+ refactor gerekli
- **Fonksiyon:** Max 50 satır (ideal), 100+ refactor gerekli

### Naming Conventions

- **Değişkenler:** camelCase, açıklayıcı
- **Fonksiyonlar:** camelCase, fiil ile başla (getUserById, handleClick)
- **Boolean'lar:** Soru şeklinde (isActive, hasPermission)
- **Constants:** UPPER_SNAKE_CASE
- **Components:** PascalCase
- **Dosyalar:** Component'ler PascalCase, diğerleri camelCase

### Comment Kuralları

/

- Fonksiyonun ne yaptığını tek cümle ile açıkla
-
- Detay gerekirse buraya
-
- @param {type} name - açıklama
- @returns {type} açıklama

\*/

- Her public fonksiyon üstünde comment
- Complex logic'lerde satır arası açıklama
- TODO ve FIXME kullan

### Clean Code Prensipleri

- **DRY:** Kod tekrarı yapma, fonksiyona çıkar
- **Single Responsibility:** Bir fonksiyon bir şey yapsın
- **Early Return:** Guard clauses kullan, iç içe if'lerden kaçın
- **Magic Numbers:** Constant'a çevir

### Error Handling

- Her async fonksiyonda try-catch
- Log'a detaylı, kullanıcıya basit mesaj
- Input validation her zaman (frontend + backend)

---

## 🔢 ERS (Element Registry System)

### Format

`PAGE.SECTION.CONTAINER.ELEMENT`

Örnek: `1.3.1.2`

- 1: HomePage
- 3: Body section
- 1: GameGrid container
- 2: İkinci GameCard

### Uygulama

<div data-ers="1.3.1" className="game-grid">

{[games.map](http://games.map)((game, i) => (

<GameCard

data-ers={`1.3.1.${i+1}`}

{...game}

/>

))}

</div>

### Registry Güncelleme

- Her yeni element → docs/ERS-REGISTRY.md'ye kaydet
- Element silindi → güncelle
- Hiyerarşi değişti → düzelt

### Kayıt İçeriği

- ERS kodu
- Element adı ve açıklama
- Dosya yolu ve satır numarası
- Parent ve children
- Props ve kullanım
- Tasarım özellikleri

---

## 🎨 Design System

### Renk Paleti (Claude-inspired)

- Background: `#F5F3EE` (warm cream)
- Card: `#EEEAE4` (light beige)
- Text Primary: `#2D2A26` (dark brown)
- Text Secondary: `#6B6661` (medium brown)
- Accent: `#D97757` (warm terracotta)

### Neumorphism Shadows

- Outer: `5px 5px 10px rgba(0,0,0,0.1), -5px -5px 10px rgba(255,255,255,0.7)`
- Inset: `inset 2px 2px 5px rgba(255,255,255,0.5), inset -2px -2px 5px rgba(0,0,0,0.1)`

### Spacing Scale

- Base: 8px
- Standard: 16px, 24px, 32px
- Large: 48px, 64px

### Border Radius

- Default: 16-20px
- Buttons: 12px
- Small elements: 8px

### Typography

- Font: Inter
- Title: 20-24px, weight 600
- Body: 14-16px, weight 400
- Line height: 1.5

### Animation

- Duration: 300-500ms (subtle animations preferred)
- Easing: ease-in-out
- Hover: Lift (-4px) + Glow

### Desktop Only Resolutions

- 1920x1080 (base)
- 2560x1440
- 2560x1080 (ultrawide)
- 3440x1440 (ultrawide)

---

## 📱 Command Kuralları

### Çalıştırabilirsin (Sonlu)

- `npm run lint`
- `npm run lint -- --fix`
- `tsc --noEmit`
- `npm run build`
- `npm test`
- `prettier --check .`
- `prettier --write .`

### Çalıştıramazsın (Sonsuz)

- `npm run dev` → "Terminal'de manuel çalıştır" de
- `npm start`
- `node server.js`
- `nodemon`

---

## 📝 Docs Standartları

### User Guide

- Senli benli dil
- Kod yok, sadece kullanım talimatları
- Adım adım rehber
- Her seviyeden kullanıcı anlayabilir

### Developer Docs

- Teknik ama anlaşılır
- Yeni başlayan öğrenciler hedef kitle
- Code examples bol
- Mermaid diagrams kullan
- Bölümler:
  - Overview
  - Architecture (diagram)
  - Database Schema
  - API Reference
  - Frontend Components
  - Algorithms (varsa)
  - Testing
  - ERS Mapping

---

## ✅ Her PR/Commit Checklist

- [ ] Dosya 300 satırdan kısa mı?
- [ ] Fonksiyonlar 50 satırdan kısa mı?
- [ ] Comment'ler ekli mi?
- [ ] Değişken isimleri anlamlı mı?
- [ ] Magic number yok mu?
- [ ] DRY principle uygulandı mı?
- [ ] Error handling var mı?
- [ ] ERS kodları eklendi mi?
- [ ] DESIGN-SYSTEM.md'ye uygun mu?
- [ ] Test yazıldı mı?

---

## 🚫 Anti-Patterns (Yapma!)

- Deep nesting (3+ seviye iç içe)
- God functions (her şeyi yapan fonksiyon)
- Meaningless variables (temp, x, data)
- Commented out code (sil!)
- console.log production'da
- Hard-coded values (constant yap)

---

# 🔄 WORKFLOWS

---

## WORKFLOW 1: Feature Development

### Trigger

Yeni feature isteği geldiğinde

### Steps

#### 1. Task Parçalama

- Büyük task'ı mantıksal parçalara böl
- Her parça 5-10 dakika olsun
- Tüm adımları listele
- Tahmini süreleri belirt

#### 2. Database (Varsa)

- prisma/schema.prisma kontrol et
- Model gerekli mi?
- Model ekle/güncelle
- Migration talimatı ver

#### 3. API Endpoints (Backend gerekirse)

- .env config kontrolü
- Eksik değişken varsa iste
- Route/controller yaz
- Validation ekle (Zod)
- Error handling

#### 4. Tasarım (UI gerekirse)

→ WORKFLOW 2: Design çalıştır

#### 5. Frontend Implementation

- Component'leri oluştur
- State management (Zustand)
- API integration
- ERS kodlarını ekle

#### 6. Testing

- Kullanıcı test etsin (npm run dev)
- Hata varsa düzelt
- Onay al

#### 7. Dokümantasyon

→ WORKFLOW 6: Documentation çalıştır

#### 8. Progress Tracking

- Markdown checklist oluştur
- Her adımda güncelle
- Timestamp ekle

---

## WORKFLOW 2: Design

### Trigger

Yeni UI component veya page isteği

### Steps

#### 1. Coherence Check (Tutarlılık)

- Mevcut component'leri/sayfaları tara
- Pattern'leri çıkar:
  - Renkler
  - Spacing
  - Shadows
  - Layouts
  - Animations
- Uyumsuzluk varsa uyar
- Tutarlı tasarım öner

#### 2. Preference Learning

- docs/DESIGN-PREFERENCES.md oku
- Geçmiş tercihleri analiz et
- Güven seviyesine göre karar ver:
  - 0-10 seçim: 3 seçenek sun
  - 10-20 seçim: 2 seçenek sun
  - 20+ seçim: 1 öneri sun (emin ol)

#### 3. Visual Preview Oluştur

- `docs/design-archive/preview-[name].html` oluştur
- Her seçenek için:
  - Gerçek görünüm
  - Hover çalışır halde
  - Artı/eksi listesi
- Design Playground ekle:
  - **BASIC:** Her zaman görünür
    - Width, height, padding
    - Colors (background, text, accent)
    - Shadow intensity
    - Border radius
    - Typography (title/body size)
    - Animation (type, speed)
  - **ADVANCED:** Toggle ile aç
    - Detailed shadows (offset, blur, opacity)
    - Individual corners
    - Transform (skew)
    - Filters (brightness, contrast, saturation, blur)
    - Typography details (letter-spacing, line-height, weight)
    - Gradient
    - Border (width, color, opacity)
    - States (disabled, active opacity)
- Canlı slider'lar
- "Use These Settings" butonu

#### 4. Seçim & Tweak

- Kullanıcı seçsin
- İsterse playground'da oynasın
- Onayladıktan sonra implement et

#### 5. Preference Kaydet

- docs/DESIGN-PREFERENCES.md güncelle
- Seçilen ve reddedilen seçenekler
- Sebepleri kaydet (varsa)
- Pattern'leri çıkar:
  - Renk tercihi (warm/cool)
  - Layout tercihi (grid/list)
  - Animation hızı (fast/slow)
  - Spacing (tight/spacious)

#### 6. Implement

- Seçilen tasarımı kodla
- ERS kodlarını ekle
- DESIGN-SYSTEM.md'ye uygun ol

#### 7. Real Test

- npm run dev talimatı ver
- Preview ile gerçeği karşılaştır
- Hata/tweak varsa düzelt

---

## WORKFLOW 3: Error Fixing

### Trigger

- Build hataları
- Lint hataları
- TypeScript hataları
- Test failures

### Steps

#### 1. Hata Tarama

Sırayla çalıştır:

npm run lint

tsc --noEmit

npm run build

#### 2. Kategorize

Hataları grupla:

- **Critical:** Build fails
- **TypeScript Errors:** Type issues
- **ESLint Warnings:** Code style
- **Dependency Issues:** Missing packages

#### 3. Rapor Ver

📊 Hata Raporu:

## Critical (1)

- src/api/games.js:42 - Syntax error

## TypeScript Errors (5)

- src/components/GameCard.tsx:15 - Type error

...

## ESLint Warnings (8)

- src/utils/helpers.js:10 - Unused variable

...

Toplam: 14 hata

#### 4. Auto-Fix

npm run lint -- --fix

prettier --write .

#### 5. Manuel Fix

- TypeScript errors düzelt
- Import errors düzelt
- Syntax errors düzelt
- Logic errors düzelt

#### 6. Verify

npm run build

npm test

#### 7. Rapor

✅ Düzeltme Tamamlandı!

- 8 ESLint (auto-fix)
- 5 TypeScript (manuel)
- 1 Syntax (manuel)

Build: ✅ Başarılı

Tests: ✅ Pass

## WORKFLOW 4: Testing

### Trigger

Manuel istek: "Test yaz"

### Steps

#### 1. Scope Belirle

- Hangi fonksiyon/component?
- Unit mi, integration mi?

#### 2. Test Dosyası Oluştur

- `[name].test.js` veya `[name].test.jsx`
- Test framework: Vitest

#### 3. Test Senaryoları Yaz

- **Happy path:** Normal kullanım
- **Edge cases:**
  - Boş input
  - Null/undefined
  - Çok büyük/küçük değerler
- **Error cases:**
  - Invalid input
  - Network errors
  - Validation failures

#### 4. Test Yaz

describe('functionName', () => {

it('normal kullanım - beklenen sonuç');

it('boş input - uygun davranış');

it('invalid input - hata fırlatır');

});

#### 5. Çalıştır

npm test

#### 6. Coverage Kontrol

- Public fonksiyonlar %100 hedef
- Component'ler critical path'ler

#### 7. Rapor

✅ Test Tamamlandı!

- 12 tests written
- 12/12 passed
- Coverage: 95%

## WORKFLOW 5: Refactoring

### Trigger

Manuel istek: "Refactor et" veya dosya 300+ satır

### Steps

#### 1. Analiz

- Dosya/component'i oku
- Code smell'leri tespit et:
  - Uzun dosya (300+ satır)
  - Uzun fonksiyon (50+ satır)
  - Duplicate code
  - Deep nesting (3+)
  - Magic numbers
  - Poor naming
  - God functions

#### 2. Refactoring Planı

- Neyi nereye taşıyacağız?
- Hangi fonksiyonları böleceğiz?
- Hangi code'u extract edeceğiz?

#### 3. Onay Al

Planı sun, onay al

#### 4. Refactor (Küçük Adımlar)

- Bir değişiklik yap
- Test et (functionality korunmalı)
- Commit et
- Sonraki adım

#### 5. Verify

- Tüm testler pass ediyor mu?
- Build başarılı mı?
- Functionality aynı mı?

#### 6. Rapor

---

## WORKFLOW 6: Documentation

### Trigger

Task tamamlandığında: "Docs güncelleyeyim mi?"

### Steps

#### 1. Scope Belirle

- Hangi feature eklendi/değişti?
- User guide gerekli mi?
- Developer docs gerekli mi?
- ERS registry güncelleme gerekli mi?

#### 2. User Guide Güncelle

Dosya: `docs/user-guide/[category]/[feature].md`

Format:

---

## WORKFLOW 6: Documentation

### Trigger

Task tamamlandığında: "Docs güncelleyeyim mi?"

### Steps

#### 1. Scope Belirle

- Hangi feature eklendi/değişti?
- User guide gerekli mi?
- Developer docs gerekli mi?
- ERS registry güncelleme gerekli mi?

#### 2. User Guide Güncelle

Dosya: `docs/user-guide/[category]/[feature].md`

Format:

#### 3. Developer Docs Güncelle

Dosya: `docs/developer/features/[feature].md`

Format:

# Feature Adı

## Overview

Kısa açıklama

## Architecture

[Mermaid diagram]

## Database Schema

Prisma model + açıklama

## API Reference

- Endpoint list
- Request/response
- Validation rules

## Frontend Components

- ERS kodları
- Props
- State
- Behavior

## Algorithms (varsa)

- Pseudocode
- Complexity
- Edge cases

## Testing

Test stratejisi

## ERS Mapping

Tablo

#### 4. ERS Registry Güncelle

Dosya: `docs/ERS-REGISTRY.md`

Her yeni element için:

- ERS kodu
- Element adı
- Dosya yolu
- Parent/children
- Props
- Tasarım
- Preview link

#### 5. Design Preferences Güncelle (Varsa)

Dosya: `docs/DESIGN-PREFERENCES.md`

Tasarım seçimi yapıldıysa:

- Seçilen seçenek
- Reddedilen seçenekler
- Pattern güncellemesi

#### 6. Rapor

✅ Dokümantasyon Tamamlandı!
Güncellenen:
docs/user-guide/features/[name].md
docs/developer/features/[name].md
docs/ERS-REGISTRY.md
docs/DESIGN-PREFERENCES.md (varsa)

## 🎯 Özet: Workflow Çağırma

- Feature development başladığında → WORKFLOW 1
- UI tasarım gerektiğinde → WORKFLOW 2
- Hata bulunduğunda → WORKFLOW 3
- Test istediğinde → WORKFLOW 4
- Refactor istediğinde → WORKFLOW 5
- Task bittiğinde → WORKFLOW 6

Her workflow birbirini çağırabilir, modüler yapı.

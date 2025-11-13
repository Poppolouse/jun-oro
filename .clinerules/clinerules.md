# Jun-Oro Project Rules

## 🎯 Çalışma Prensibi: İteratif Geliştirme

### Checkpoint Sistemi

- Task bazlı dur: Anlamlı bir iş bitince checkpoint yap
- Maksimum 5 dakikalık iş parçaları
- Her checkpoint'te:
  - Değişen dosyaları listele
  - Test talimatı ver (npm run dev, curl, vb.)
  - Hata kontrolü iste
  - Devam onayı al
- Asla uzun süre kesintisiz kod yazma

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
{games.map((game, i) => (
<GameCard
data-ers={1.3.1.${i+1}}
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

her zaman powershell için terminal komutu yazacaksın o yüzden && kullanma onun yerine ; kullan.

# Design Workflow

## Trigger

ui ile herhangi bir değişiklik olacağı zaman.

## Steps

### 1. Coherence Check (Tutarlılık)

- Mevcut component'leri/sayfaları tara
- Pattern'leri çıkar:
  - Renkler
  - Spacing
  - Shadows
  - Layouts
  - Animations
- Uyumsuzluk varsa uyar
- Tutarlı tasarım öner

### 2. Preference Learning

- docs/DESIGN-PREFERENCES.md oku
- Geçmiş tercihleri analiz et
- Güven seviyesine göre karar ver:
  - 0-10 seçim: 3 seçenek sun
  - 10-20 seçim: 2 seçenek sun
  - 20+ seçim: 1 öneri sun (emin ol)

### 3. Visual Preview Oluştur

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

### 4. Seçim & Tweak

- Kullanıcı seçsin
- İsterse playground'da oynasın
- Onayladıktan sonra implement et

### 5. Preference Kaydet

- docs/DESIGN-PREFERENCES.md güncelle
- Seçilen ve reddedilen seçenekler
- Sebepleri kaydet (varsa)
- Pattern'leri çıkar:
  - Renk tercihi (warm/cool)
  - Layout tercihi (grid/list)
  - Animation hızı (fast/slow)
  - Spacing (tight/spacious)

### 6. Implement

- Seçilen tasarımı kodla
- ERS kodlarını ekle
- DESIGN-SYSTEM.md'ye uygun ol

### 7. Real Test

- npm run dev talimatı ver
- Preview ile gerçeği karşılaştır
- Hata/tweak varsa düzelt

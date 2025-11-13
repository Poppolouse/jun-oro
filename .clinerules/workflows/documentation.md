# Documentation Workflow

## Trigger

Task tamamlandığında: "Docs güncelleyeyim mi?"

## Steps

### 1. Scope Belirle

- Hangi feature eklendi/değişti?
- User guide gerekli mi?
- Developer docs gerekli mi?
- ERS registry güncelleme gerekli mi?

### 2. User Guide Güncelle

Dosya: `docs/user-guide/[category]/[feature].md`

Format:

# Feature Adı

Kısa açıklama

## Nasıl Kullanılır

1. Adım 1
2. Adım 2
3. Adım 3

## İpuçları

- İpucu 1
- İpucu 2

## İlgili Sayfalar

- [Link 1]
- [Link 2]

### 3. Developer Docs Güncelle

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

### 4. ERS Registry Güncelle

Dosya: `docs/ERS-REGISTRY.md`

Her yeni element için:

- ERS kodu
- Element adı
- Dosya yolu
- Parent/children
- Props
- Tasarım
- Preview link

### 5. Design Preferences Güncelle (Varsa)

Dosya: `docs/DESIGN-PREFERENCES.md`

Tasarım seçimi yapıldıysa:

- Seçilen seçenek
- Reddedilen seçenekler
- Pattern güncellemesi

### 6. Rapor

✅ Dokümantasyon Tamamlandı!

Güncellenen:

- docs/user-guide/features/[name].md
- docs/developer/features/[name].md
- docs/[ERS-REGISTRY.md](http://ERS-REGISTRY.md)
- docs/[DESIGN-PREFERENCES.md](http://DESIGN-PREFERENCES.md) (varsa)

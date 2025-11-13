# Testing Workflow

## Trigger

Manuel istek: "Test yaz"

## Steps

### 1. Scope Belirle

- Hangi fonksiyon/component?
- Unit mi, integration mi?

### 2. Test Dosyası Oluştur

- `[name].test.js` veya `[name].test.jsx`
- Test framework: Vitest

### 3. Test Senaryoları Yaz

- **Happy path:** Normal kullanım
- **Edge cases:**
  - Boş input
  - Null/undefined
  - Çok büyük/küçük değerler
- **Error cases:**
  - Invalid input
  - Network errors
  - Validation failures

### 4. Test Yaz

describe('functionName', () => {

it('normal kullanım - beklenen sonuç');

it('boş input - uygun davranış');

it('invalid input - hata fırlatır');

});

### 5. Çalıştır

npm test

### 6. Coverage Kontrol

- Public fonksiyonlar %100 hedef
- Component'ler critical path'ler

### 7. Rapor

✅ Test Tamamlandı!

- 12 tests written
- 12/12 passed
- Coverage: 95%

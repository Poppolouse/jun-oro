# Error Fixing Workflow

## Trigger

- Build hataları
- Lint hataları
- TypeScript hataları
- Test failures

## Steps

### 1. Hata Tarama

Sırayla çalıştır:
npm run lint

tsc --noEmit

npm run build

### 2. Kategorize

Hataları grupla:

- **Critical:** Build fails
- **TypeScript Errors:** Type issues
- **ESLint Warnings:** Code style
- **Dependency Issues:** Missing packages

### 3. Rapor Ver

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

### 4. Auto-Fix

npm run lint -- --fix

prettier --write .

### 5. Manuel Fix

- TypeScript errors düzelt
- Import errors düzelt
- Syntax errors düzelt
- Logic errors düzelt

### 6. Verify

npm run build
npm test

### 7. Rapor

✅ Düzeltme Tamamlandı!

- 8 ESLint (auto-fix)
- 5 TypeScript (manuel)
- 1 Syntax (manuel)

Build: ✅ Başarılı

Tests: ✅ Pass

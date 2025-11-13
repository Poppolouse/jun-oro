# Jun-Oro'ya Katkıda Bulunma

Jun-Oro gaming platformuna katkıda bulunmak için bu rehberi izleyin. Her türlü katkıyı değerli buluyoruz: bug raporları, feature önerileri, dokümantasyon iyileştirmeleri ve kod katkıları.

## 📋 İçindekiler

- [Katılım Süreci](#katılım-süreci)
- [Code Review Kuralları](#code-review-kuralları)
- [Branch Stratejisi](#branch-stratejisi)
- [Commit Message Formatı](#commit-message-formatı)
- [Pull Request Template](#pull-request-template)
- [Issue Reporting Kuralları](#issue-reporting-kuralları)
- [Kodlama Standartları](#kodlama-standartları)
- [Test Kuralları](#test-kuralları)

## 🔄 Katılım Süreci

### 1. Başlarken

- [ ] Bu rehberi dikkatlice oku
- [ ] [Code of Conduct](./CODE_OF_CONDUCT.md)'ı kabul et
- [ ] Mevcut [issues](https://github.com/Poppolouse/jun-oro/issues)'ı kontrol et
- [ ] [discussions](https://github.com/Poppolouse/jun-oro/discussions)'ı incele

### 2. Hazırlık

```bash
# Fork yap
https://github.com/Poppolouse/jun-oro/fork

# Clone yap
git clone https://github.com/YOUR_USERNAME/jun-oro.git
cd jun-oro

# Remote ekle
git remote add upstream https://github.com/Poppolouse/jun-oro.git

# Development branch'ine geç
git checkout -b feature/your-feature-name
```

### 3. Geliştirme

- [ ] Kodlama standartlarına uyun
- [ ] Test yazın
- [ ] Dokümantasyon güncelleyin
- [ ] Değişiklikleri küçük tutun

### 4. Test Etme

```bash
# Lint kontrolü
npm run lint

# Test çalıştırma
npm test

# Build kontrolü
npm run build
```

### 5. Pull Request

- [ ] PR oluşturun
- [ ] Description doldurun
- [ ] Review bekleyin
- [ ] Feedback'i uygulayın

## 🔍 Code Review Kuralları

### Reviewer İçin

- [ ] Kod kalitesini kontrol et
- [ ] Test coverage'ı kontrol et
- [ ] Performans etkisini değerlendir
- [ ] Güvenlik açıklarını ara
- [ ] Dokümantasyonu kontrol et

### Review Süreci

1. **Otomatik Kontroller**: CI/CD pipeline'ı çalışır
2. **Kod İncelemesi**: Manuel review yapılır
3. **Test Onayı**: Tüm testler geçmeli
4. **Merge Kararı**: Maintainer onayı gerekir

### Review Checklist'i

```markdown
- [ ] Kodlama standartlarına uygun
- [ ] Testler yazılmış ve geçiyor
- [ ] Dokümantasyon güncellenmiş
- [ ] Breaking changes belgelenmiş
- [ ] Performans etkisi değerlendirilmiş
- [ ] Güvenlik kontrolü yapılmış
```

## 🌿 Branch Stratejisi

### Main Branch'ler

- `main`: Production-ready kod
- `develop`: Geliştirme için ana branch
- `staging`: Pre-production testleri

### Feature Branch'leri

```bash
# Format: type/description
feature/user-authentication
bug/login-validation-fix
docs/api-documentation
refactor/database-queries
hotfix/security-patch
release/v1.2.0
```

### Branch Kuralları

1. **Main'den branch oluştur**: `git checkout -b feature/name main`
2. **Küçük değişiklikler**: Bir feature per branch
3. **Descriptive isimler**: Ne yaptığını anlatan isimler
4. **Sık sync**: `git pull upstream main` düzenli yap

### Branch Merge Süreci

```bash
# 1. Main'i güncelle
git checkout main
git pull upstream main

# 2. Feature branch'ini güncelle
git checkout feature/your-feature
git rebase main

# 3. Merge et
git checkout develop
git merge --no-ff feature/your-feature

# 4. Push yap
git push origin develop
```

## 📝 Commit Message Formatı

### Conventional Commits

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Type'ler

- `feat`: Yeni feature
- `fix`: Bug düzeltmesi
- `docs`: Dokümantasyon değişikliği
- `style`: Kod formatı, semicolon eksikliği
- `refactor`: Kod yeniden yapılandırma
- `test`: Test ekleme veya düzeltme
- `chore`: Build process, dependency güncellemesi

### Örnekler

```bash
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh when access token expires.
Add refresh token storage and validation logic.

Closes #123

fix(api): resolve game search pagination issue

The pagination was not working correctly when searching for games
with special characters. Added proper URL encoding.

BREAKING CHANGE: The search endpoint now returns paginated results.
```

### Commit Kuralları

1. **Present tense**: "add" değil "added"
2. **Lowercase**: "Fix" değil "fix"
3. **No period**: Subject nokta ile bitmez
4. **Separate body**: Boş satır ile ayır
5. **Issue reference**: `Closes #123` formatı

## 📄 Pull Request Template

### PR Başlığı

```markdown
type(scope): brief description
```

### PR Description

```markdown
## 📋 Açıklama

Bu PR neyi değiştiriyor? Kısa ve net bir açıklama.

## 🔄 Değişiklikler

- [ ] Yeni feature eklendi
- [ ] Bug düzeltildi
- [ ] Dokümantasyon güncellendi
- [ ] Testler eklendi

## 🧪 Testler

- [ ] Unit testler yazıldı
- [ ] Integration testler yazıldı
- [ ] Manual test yapıldı
- [ ] Cross-browser test yapıldı

## 📸 Ekran Görüntüleri (varsa)

Değişikliklerin öncesi/sonrası ekran görüntüleri.

## 🔗 İlgili Issue'lar

Closes #123, #456

## ✅ Checklist

- [ ] Kodlama standartlarına uyuyorum
- [ ] Kendi kodumu review ettim
- [ ] Testler geçiyor
- [ ] Dokümantasyon güncellendi
- [ ] Breaking changes belgelendi
```

### PR Kategorileri

- **Feature**: Yeni özellik ekler
- **Bug**: Hata düzeltir
- **Enhancement**: Mevcut özelliği geliştirir
- **Documentation**: Dokümantasyon günceller
- **Refactoring**: Kod yapısını iyileştirir
- **Performance**: Performans optimizasyonu

## 🐛 Issue Reporting Kuralları

### Bug Report

```markdown
## 🐛 Bug Açıklaması

Kısa ve net bir açıklama.

## 🔄 Tekrarlama Adımları

1. '...' butonuna tıkla
2. Formu doldur
3. Submit butonuna bas
4. Hata mesajı görünür

## 🎯 Beklenen Davranış

Ne olması gerektiğini açıkla.

## 📱 Ortam Bilgileri

- **OS**: Windows 11 / macOS 13.0 / Ubuntu 22.04
- **Browser**: Chrome 108 / Firefox 107 / Safari 16
- **Version**: v1.2.3

## 📸 Ekran Görüntüsü/GIF

Hatanın gösterildiği ekran görüntüsü.

## 📋 Ek Bilgiler

- Console hataları
- Network request'ler
- Kullanıcı verileri (sadece test verileri)

## 🔗 Ek Bilgiler

- İlgili issue'lar
- Benzer issue'lar
```

### Feature Request

```markdown
## 🚀 Feature Açıklaması

Eklenmesini istediğiniz özellik.

## 💡 Motivasyon

Bu özellik neden önemli? Hangi sorunu çözüyor?

## 📝 Önerilen Çözüm

Nasıl implemente edilebileceğine dair fikirleriniz.

## 🔄 Alternatifler

Düşündüğünüz diğer çözüm yöntemleri.

## 📸 Ekran Görüntüleri/Tasarım

Tasarım mock'ları veya örnekler.

## 🔗 İlgili Kaynaklar

Benzer projeler, referanslar, dokümanlar.
```

### Issue Kuralları

1. **Ara önce**: Mevcut issue'ları kontrol et
2. **Tek issue**: Bir issue'da tek sorun
3. **Net başlık**: Ne olduğunu anlatan başlık
4. **Detaylı açıklama**: Adımları ve ortamı belirt
5. **Etiketler**: Uygun etiketleri kullan

## 📏 Kodlama Standartları

### Genel Kurallar

- **JavaScript/JSX**: ES6+ syntax kullan
- **React**: Functional components ve hooks
- **CSS**: Tailwind CSS utility classes
- **Naming**: [Naming Conventions](./CODING_STANDARDS.md)'a uyun

### Dosya Organizasyonu

```
src/
├── components/          # Reusable components
│   ├── common/         # Generic components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom hooks
├── services/           # API services
├── utils/              # Utility functions
├── contexts/           # React contexts
└── styles/             # Global styles

backend/
├── src/
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── utils/           # Utility functions
│   └── lib/            # External libraries
├── prisma/            # Database schema
└── tests/             # Test files
```

### Component Yapısı

```jsx
// Component structure
import React from "react";
import { ComponentName } from "./ComponentName";

/**
 * Component açıklaması
 * @param {Object} props - Component props
 * @param {string} props.title - Başlık
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} Rendered component
 */
export default function ComponentName({ title, onClick }) {
  // Component logic

  return <div className="component-name">{/* JSX content */}</div>;
}
```

### API Endpoint Yapısı

```javascript
// Route structure
import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "../middleware/validation.js";

const router = Router();

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    // Business logic
    const user = await getUserById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});
```

## 🧪 Test Kuralları

### Test Structure

```javascript
// Test file structure
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ComponentName from "./ComponentName";

describe("ComponentName", () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it("should render correctly", () => {
    render(<ComponentName title="Test Title" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = vi.fn();
    render(<ComponentName title="Test" onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Kuralları

1. **Arrange-Act-Assert**: AAA pattern'ını kullan
2. **Descriptive tests**: Ne test ettiğini anlatan isimler
3. **One assertion**: Test başına bir assertion (mümkünse)
4. **Mock external dependencies**: API'lar ve external servisler
5. **Coverage**: %80+ coverage hedefi

### Test Komutları

```bash
# Tüm testleri çalıştır
npm test

# Watch modunda çalıştır
npm run test:watch

# Coverage raporu
npm run test:coverage

# Spesifik test dosyası
npm test ComponentName.test.jsx
```

## 🚀 Deployment Kuralları

### Pre-deployment Checklist

- [ ] Tüm testler geçiyor
- [ ] Build başarılı
- [ ] Lint hataları yok
- [ ] Security scan temiz
- [ ] Performance testleri geçiyor

### Deployment Process

1. **Staging'e deploy**: Önce test ortamına
2. **Manual test**: Staging'de manuel test
3. **Production'a deploy**: Onaydan sonra
4. **Monitor**: Canlı ortamı izle
5. **Rollback plan**: Sorun olursa geri dön

## 🏆 Katkı Türleri

### Kod Katkıları

- **Bug fixes**: Hata düzeltmeleri
- **Features**: Yeni özellikler
- **Refactoring**: Kod iyileştirmeleri
- **Performance**: Optimizasyonlar
- **Documentation**: Dokümantasyon güncellemeleri

### Kod Dışı Katkılar

- **Bug reports**: Detaylı hata raporları
- **Feature requests**: Well-researched öneriler
- **Documentation**: Dokümantasyon iyileştirmeleri
- **Design**: UI/UX iyileştirmeleri
- **Testing**: Test senaryoları ve raporları
- **Translation**: Çeviri katkıları

## 🎖️ Ödüller ve Takdir

### Katkı Seviyeleri

- **🌱 First Timer**: İlk katkı
- **🐛 Bug Hunter**: Bug düzeltmeleri
- **✨ Feature Master**: Yeni özellikler
- **📚 Documentation Hero**: Dokümantasyon katkıları
- **🧪 Test Champion**: Test katkıları
- **🚀 Performance Guru**: Performans iyileştirmeleri
- **🎨 Design Expert**: Tasarım katkıları

### Takdir Kriterleri

- **Kalite**: Kod kalitesi ve test coverage
- **Etki**: Proje üzerindeki etkisi
- **Süreklilik**: Sürekli katkılar
- **Yardım**: Diğer katılımcılara yardım
- **İnovasyon**: Yeni ve yaratıcı çözümler

## 📞 İletişim ve Destek

### Sorular İçin

- **GitHub Discussions**: Genel sorular ve fikirler
- **Issues**: Spesifik sorunlar ve öneriler
- **Email**: [maintainer@jun-oro.com](mailto:maintainer@jun-oro.com)

### Topluluk

- **Discord**: [Jun-Oro Discord](https://discord.gg/jun-oro)
- **Twitter**: [@JunOroDev](https://twitter.com/JunOroDev)
- **Blog**: [Jun-Oro Blog](https://blog.jun-oro.com)

## 📚 Ek Kaynaklar

### Öğrenme Kaynakları

- [React Documentation](https://react.dev/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)

### Araçlar

- **VS Code**: Tavsiye edilen IDE
- **Git**: Version control
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Testing framework

## 🙏 Teşekkürler

Jun-Oro'ya katkıda bulunduğunuz için teşekkür ederiz! Her katkı, platformu daha iyi hale getirmemize yardımcı oluyor. Topluluğumuzun bir parçası olduğunuz için minnettarız.

---

**Unutmayın**: Küçük katkılar bile büyük fark yaratabilir. Başlamak için en iyi zaman şimdi!

## 🚨 KRİTİK KURALLAR

### ⛔ Kullanıcı Yönetimi Yasağı
**ASLA kullanıcıları silme!** Bu kural hiçbir durumda ihlal edilemez:
- Kullanıcı verilerini silmek kesinlikle yasaktır
- Sadece kullanıcı tarafından özel olarak talep edilirse silinebilir
- Silme işlemi öncesinde mutlaka kullanıcıdan onay alınmalıdır
- Bu kural tüm admin işlemleri için geçerlidir

## 🔍 Element Registry System (ERS)

**Amaç:** Site üzerindeki her ögeye unique, kalıcı, anlamlı bir ID vermek.

**Format:** [Sayfa].[Alt Sayfa].[Bölge][Öge]

**Kullanım Alanları:**
- 🎓 Tutorial ve onboarding sistemleri
- 📊 Analytics ve user tracking
- 🧪 A/B testing
- 🤖 Automated testing
- 📚 Dokümantasyon
- ♿ Accessibility iyileştirmeleri
- 🐛 Debug ve development tools

**Bölgeler:**
- H = Header | L = Left Sidebar | R = Right Sidebar | B = Body | F = Footer
- Birden fazla sidebar: L1, L2, R1, R2

**KURALLAR:**
1. Her interactive ögeye unique selector + registry ID
2. Aynı tipte birden fazla öge varsa unique attribute kullan
3. elementRegistry.json'da saklanır (Git'e commit edilmeli)
4. Selector değişmezse ID değişmez (backward compatibility)

**Veri Yapısı:**
{
  "selector": "#unique-id",
  "registryId": "1.0.H1",
  "label": "Login Button",
  "page": 1,
  "subpage": 0,
  "zone": "H",
  "metadata": {
    "type": "button",
    "feature": "authentication",
    "criticalPath": true
  }
}

## 📁 Dosya ve Klasör Organizasyonu

### 1. Feature-Based Klasör Yapısı

```
/src
  /features
    /arkade
      /components
      /hooks
      /api
      /utils
      index.js
    /sinepedi
      /components
      ...
  /shared
    /components (Button, Card, Input)
    /hooks
    /utils
```

**Avantaj:** Her feature izole, kolay bulunur, bağımsız geliştirilebilir.

---

### 2. Flat Klasör Yapısı (Max 2 Seviye)

```
/src
  /components
  /pages
  /hooks
  /utils
  /api
```

**Avantaj:** Basit, aşırı iç içe klasör yok, hızlı navigasyon.

---

### 3. Dosya İsimlendirme: PascalCase (Components)

- `Button.jsx`, `UserCard.jsx`, `GameList.jsx`
- **Kural:** Component dosyaları PascalCase, diğerleri camelCase

---

### 4. Dosya İsimlendirme: kebab-case (Tümü)

- `button.jsx`, `user-card.jsx`, `game-list.jsx`
- **Kural:** Tüm dosyalar küçük harf + tire

---

### 5. Index Barrel Exports

```jsx
// /components/index.js
export { Button } from './Button'
export { Card } from './Card'

// Kullanım:
import { Button, Card } from '@/components'
```

**Avantaj:** Temiz import'lar, kolay refactoring.

---

## 🧩 Component Kuralları

### 6. Tek Sorumluluk İlkesi

- Her component **tek bir şey** yapar
- Büyük component'ler daha küçüklere bölünür
- Max 150-200 satır (kılavuz)

---

### 7. Props Destructuring (Her Zaman)

```jsx
// ✅ İyi
function Button({ text, onClick, variant }) {
  return <button onClick={onClick}>{text}</button>
}

// ❌ Kötü
function Button(props) {
  return <button onClick={props.onClick}>{props.text}</button>
}
```

---

### 8. PropTypes veya TypeScript

```jsx
// PropTypes ile
Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
}

// Veya TypeScript kullan
```

**Karar:** Şimdilik PropTypes, ileride TypeScript'e geçilebilir.

---

### 9. Default Props

```jsx
Button.defaultProps = {
  variant: 'primary',
  size: 'medium',
}
```

**Avantaj:** Props eksikse hata vermez, default değer kullanır.

---

### 10. Composition Over Conditional Rendering

```jsx
// ✅ İyi - Farklı component'ler
<PrimaryButton />
<SecondaryButton />

// ❌ Kötü - Aynı component içinde çok fazla if/else
function Button({ variant }) {
  if (variant === 'primary') return <div>...</div>
  if (variant === 'secondary') return <div>...</div>
  ...
}
```

---

## 🎨 Styling Kuralları

### 11. TailwindCSS Utility Classes (Öncelik)

```jsx
// ✅ İyi
<button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">

// ❌ Kötü - Inline style
<button style= background: 'blue', padding: '8px 16px' >
```

---

### 12. Custom Classes (Sadece Gerekirse)

```jsx
// Sadece çok uzun veya tekrarlı style'lar için
<button className="btn-primary">

// styles.css
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded;
}
```

---

### 13. Responsive Classes

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

**Kural:** Mobile-first, breakpoint'leri her zaman düşün.

---

## 🪝 Hooks ve State Yönetimi

### 14. Custom Hooks (Reusable Logic)

```jsx
// useAuth.js
export function useAuth() {
  const [user, setUser] = useState(null)
  // ... logic
  return { user, login, logout }
}

// Kullanım
const { user, login } = useAuth()
```

**Kural:** Tekrarlı logic varsa custom hook yap.

---

### 15. State En Yakın Component'te

- State sadece kullanıldığı yerde olsun
- Gereksiz global state yapma
- Prop drilling sorun olursa context/zustand kullan

---

### 16. useEffect Dependency Array (Her Zaman)

```jsx
// ✅ İyi
useEffect(() => {
  fetchData(userId)
}, [userId])

// ❌ Kötü - Eksik dependency
useEffect(() => {
  fetchData(userId)
}, [])
```

---

## 📝 Kod Yazım Kuralları

### 17. Açıklayıcı İsimler

```jsx
// ✅ İyi
const filteredActiveGames = games.filter(game => game.status === 'active')
const handleUserLogin = () => { ... }

// ❌ Kötü
const data = games.filter(g => g.s === 'active')
const handle = () => { ... }
```

---

### 18. Erken Return Pattern

```jsx
// ✅ İyi
function GameCard({ game }) {
  if (!game) return null
  if (game.isDeleted) return <DeletedCard />
  
  return <div>{game.title}</div>
}

// ❌ Kötü - İç içe if'ler
function GameCard({ game }) {
  if (game) {
    if (!game.isDeleted) {
      return <div>{game.title}</div>
    }
  }
}
```

---

### 19. Const > Let > Var (Asla Var Kullanma)

```jsx
// ✅ İyi
const API_URL = 'https://api.example.com'
let count = 0

// ❌ Kötü
var API_URL = 'https://api.example.com'
```

---

### 20. Arrow Functions (Modern Syntax)

```jsx
// ✅ İyi - Kısa ve modern
const add = (a, b) => a + b
const users = [data.map](http://data.map)(user => [user.name](http://user.name))

// ✅ İyi - Çok satırlı
const processData = (data) => {
  const filtered = data.filter(...)
  return [filtered.map](http://filtered.map)(...)
}

// ❌ Eski syntax (gereksiz)
function add(a, b) {
  return a + b
}
```
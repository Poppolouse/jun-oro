# Backend ve API Kılavuzu

Bu kılavuz, Jun-Oro'nun backend'i ile nasıl çalışılacağını, API'nin nasıl kullanılacağını ve yeni API endpoint'lerinin nasıl ekleneceğini açıklar.

---

### Backend Teknolojileri

Backend'imiz aşağıdaki temel teknolojiler üzerine kurulmuştur:

*   **Node.js:** Sunucu tarafı JavaScript çalışma ortamı.
*   **Express.js:** Minimalist ve esnek bir web uygulama çatısı.
*   **Prisma:** Modern bir veritabanı ORM'si. Veritabanı ile güvenli ve kolay etkileşim sağlar.
*   **Zod:** Şema tabanlı veri doğrulama kütüphanesi. Gelen isteklerin beklenen formatta olduğundan emin olmak için kullanılır.

---

### API Genel Yapısı

Backend API'miz, standart **RESTful** prensiplerine uygun olarak tasarlanmıştır. Tüm endpoint'ler `/api` ön eki altında bulunur.

**Temel Endpoint Yapısı:**
API, kaynak odaklı bir yapı kullanır. Örneğin, oyunlarla ilgili tüm işlemler ` /api/games` endpoint'i altında toplanmıştır.

*   `GET /api/games`: Tüm oyunları listeler.
*   `GET /api/games/{id}`: Belirli bir oyunu getirir.
*   `POST /api/games`: Yeni bir oyun oluşturur.
*   `PUT /api/games/{id}`: Belirli bir oyunu günceller.
*   `DELETE /api/games/{id}`: Belirli bir oyunu siler.

**API Yanıt Formatı:**
Tüm başarılı yanıtlar (response), tutarlı bir JSON yapısı içinde döner:
```json
{
  "success": true,
  "data": { ... }, // İstenen veri burada yer alır
  "message": "İşlem başarıyla tamamlandı" // Opsiyonel mesaj
}
```
Başarısız yanıtlar ise `success: false` ve bir `error` alanı içerir.

---

### Yeni Bir API Endpoint'i Nasıl Eklenir?

Projeye yeni bir API endpoint'i eklemek için aşağıdaki adımları izleyin. Örnek olarak, "türler" (genres) için yeni bir endpoint eklediğimizi varsayalım.

**1. Veritabanı Şemasını Güncelleme (Gerekirse):**
Eğer yeni endpoint'iniz veritabanında yeni bir tablo veya alan gerektiriyorsa, önce `backend/prisma/schema.prisma` dosyasını güncelleyin.
```prisma
model Genre {
  id   Int    @id @default(autoincrement())
  name String @unique
}
```
Ardından, değişikliği veritabanına uygulamak için migration çalıştırın:
```bash
cd backend
npm run db:migrate
```

**2. Yeni Route Dosyası Oluşturma:**
`backend/src/routes` klasörü içinde `genres.js` adında yeni bir dosya oluşturun. Bu dosya, `/api/genres` altındaki tüm endpoint'leri içerecektir.
```javascript
import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET /api/genres - Tüm türleri listele
router.get('/', async (req, res, next) => {
  try {
    const genres = await prisma.genre.findMany();
    res.json({ success: true, data: genres });
  } catch (error) {
    next(error); // Hata yönetimi middleware'ine yönlendir
  }
});

export default router;
```

**3. Ana Router'a Ekleme:**
Oluşturduğunuz yeni router'ı ana uygulama dosyasına (`backend/src/app.js` veya benzeri bir dosya) tanıtmanız gerekir.
```javascript
// backend/src/app.js içinde
import genreRoutes from './routes/genres.js';
// ...
app.use('/api/genres', genreRoutes);
```

**4. Veri Doğrulama (Önerilir):**
Gelen veriyi doğrulamak için `backend/src/lib/validation.js` dosyasına yeni bir Zod şeması ekleyin ve bunu route'unuzda kullanın. Bu, API'nizin güvenliğini artırır.

---

### Prisma ile Çalışmak

Prisma, veritabanı ile etkileşim kurmanın en kolay yoludur.

*   **Veri Çekme:** `prisma.user.findMany()`, `prisma.game.findUnique({ where: { id: ... } })`
*   **Veri Oluşturma:** `prisma.user.create({ data: { ... } })`
*   **Veri Güncelleme:** `prisma.user.update({ where: { id: ... }, data: { ... } })`

Veritabanı şemasında yaptığınız her değişiklikten sonra, Prisma Client'ı güncellemek için şu komutu çalıştırmayı unutmayın:
```bash
cd backend
npm run db:generate
```

Daha fazla bilgi için resmi [Prisma dokümantasyonuna](https://www.prisma.io/docs/) göz atın.

### API Dokümantasyonu

Projenin API dokümantasyonu, geliştirme sunucusu çalışırken `http://localhost:3000/api-docs` adresinde otomatik olarak oluşturulur ve sunulur. Bu arayüz (Swagger UI), mevcut tüm endpoint'leri, kabul ettikleri parametreleri ve döndürdükleri yanıtları interaktif bir şekilde keşfetmenizi sağlar.

Yeni bir endpoint eklediğinizde, bu dokümantasyonun da güncellenmesi için kodunuza JSDoc formatında yorumlar eklemeniz önerilir.
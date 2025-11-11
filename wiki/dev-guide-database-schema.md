# Veritabanı Şeması Kılavuzu

Bu doküman, Jun-Oro platformunun veritabanı yapısını, ana modelleri (tabloları) ve bu modeller arasındaki ilişkileri açıklar. Veritabanı şemamız, `backend/prisma/schema.prisma` dosyasında Prisma şema dili kullanılarak tanımlanmıştır.

---

### Prisma'ya Genel Bakış

Prisma, veritabanı ile etkileşim kurmamızı sağlayan modern bir ORM'dir (Object-Relational Mapper). `schema.prisma` dosyası, veritabanı modellerimiz için tek bir doğruluk kaynağı (single source of truth) görevi görür. Bu dosyada yapılan değişiklikler, `db:migrate` komutuyla veritabanına yansıtılır.

---

### Ana Modeller

Aşağıda, uygulamanın temel işlevlerini destekleyen en önemli modeller ve açıklamaları yer almaktadır.

#### `User`
Uygulamadaki her bir kullanıcıyı temsil eder.

*   `id`: Kullanıcının benzersiz kimliği (CUID).
*   `email`, `username`: Giriş için kullanılan benzersiz bilgiler.
*   `password`: Bcrypt ile hash'lenmiş kullanıcı şifresi.
*   `role`: Kullanıcının rolü (`user` veya `admin`).
*   **İlişkiler:** Bir kullanıcının birden çok `LibraryEntry` (kütüphane öğesi), `GameSession` (oyun oturumu) ve diğer birçok kaydı olabilir.

#### `Game`
Platformdaki her bir oyunu temsil eder. Bu tablodaki veriler genellikle IGDB gibi harici API'lerden alınır.

*   `id`: Oyunun benzersiz kimliği (genellikle IGDB ID'si).
*   `name`: Oyunun adı.
*   `cover`, `summary`, `genres`, `platforms`: Oyuna ait meta veriler.
*   `steamData`, `igdbData`, `hltbData`: Harici API'lerden gelen ham verilerin saklandığı JSON alanları.
*   **İlişkiler:** Bir oyun, birçok kullanıcının kütüphanesinde (`LibraryEntry`) yer alabilir ve birçok oyun oturumuna (`GameSession`) sahip olabilir.

#### `LibraryEntry`
Bu model, bir **kullanıcı** ile bir **oyun** arasındaki bağlantıyı kurar. Bir kullanıcının bir oyunu kütüphanesine eklediğinde bu tabloda bir kayıt oluşur.

*   `userId`, `gameId`: Hangi kullanıcının hangi oyuna sahip olduğunu belirtir. Bu ikili benzersizdir.
*   `category`: Oyunun kullanıcının kütüphanesindeki durumunu belirtir (örn: `playing`, `completed`, `backlog`, `wishlist`).
*   `playtime`: Kullanıcının bu oyunda geçirdiği toplam süre (dakika cinsinden).
*   `rating`: Kullanıcının oyuna verdiği kişisel puan.
*   `notes`: Kullanıcının oyunla ilgili kişisel notları.

#### `GameSession`
Bir kullanıcının bir oyunu oynadığı belirli bir zaman dilimini kaydeder.

*   `userId`, `gameId`: Hangi kullanıcının hangi oyunu oynadığını belirtir.
*   `startTime`, `endTime`: Oturumun başlangıç ve bitiş zamanları.
*   `playtime`: Bu spesifik oturumun süresi.
*   `isActive`: Oturumun hala devam edip etmediğini gösteren boolean bir değer.

#### `Campaign`
Bir oyunun içindeki görevleri veya bölümleri (campaigns) temsil eder.

*   `gameId`: Hangi oyuna ait olduğunu belirtir.
*   `name`: Kampanyanın adı.
*   `isMainCampaign`: Ana hikaye olup olmadığını belirtir.

---

### İlişkileri Anlamak

Prisma, modeller arasındaki ilişkileri `@relation` direktifi ile tanımlar.

**Örnek: `User` ve `LibraryEntry` İlişkisi**

*   **Bir-Çok İlişki (One-to-Many):** Bir `User`, birden çok `LibraryEntry`'ye sahip olabilir.
    *   `User` modelinde: `libraryEntries LibraryEntry[]`
    *   `LibraryEntry` modelinde: `user User @relation(fields: [userId], references: [id])`

Bu yapı sayesinde, bir kullanıcıya ait tüm kütüphane öğelerini kolayca sorgulayabiliriz:
```javascript
const userLibrary = await prisma.user.findUnique({
  where: { id: userId },
  include: { libraryEntries: true }
});
```

---

### Şemayı Değiştirme ve Güncelleme

Veritabanı şemasında bir değişiklik yapmanız gerektiğinde (örneğin, bir modele yeni bir alan eklemek), aşağıdaki adımları izleyin:

1.  `backend/prisma/schema.prisma` dosyasında istediğiniz değişikliği yapın.
2.  Değişikliklerinizi yansıtan yeni bir migration dosyası oluşturun:
    ```bash
    cd backend
    npm run db:migrate -- --name "yeni-alan-eklendi"
    ```
    (`--name` parametresi, migration'a açıklayıcı bir isim vermenizi sağlar).
3.  Prisma Client'ı yeni şema ile senkronize etmek için aşağıdaki komutu çalıştırın:
    ```bash
    npm run db:generate
    ```

Bu adımlar, veritabanı şemanızın ve kodunuzun her zaman senkronize kalmasını sağlar.
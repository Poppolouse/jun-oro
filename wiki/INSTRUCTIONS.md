# Wiki Dosyalarını GitHub'a Yükleme Talimatları

Bu doküman, bu klasörde oluşturulan Markdown (`.md`) dosyalarını projenizin GitHub wiki'sine nasıl aktaracağınızı adım adım açıklar.

GitHub wikileri, aslında kendi Git repolarıdır. Dosyaları eklemenin en kolay yolu, wiki reposunu yerel makinenize klonlamak, dosyaları eklemek ve ardından değişiklikleri geri göndermektir (push).

---

### Adım 1: Wiki Reposunu Klonlama

1.  Projenizin GitHub sayfasında **"Wiki"** sekmesine gidin.
2.  Wiki sayfasının sağ üst köşesinde, **"Clone this wiki locally"** (Bu wiki'yi yerel olarak klonla) seçeneğini bulun ve gösterilen URL'yi kopyalayın. URL genellikle şu formatta olacaktır: `https://github.com/KULLANICI_ADINIZ/PROJE_ADINIZ.wiki.git`
3.  Terminalinizde, bu repoyu klonlamak için uygun bir yere gidin ve aşağıdaki komutu çalıştırın:
    ```bash
    git clone https://github.com/KULLANICI_ADINIZ/PROJE_ADINIZ.wiki.git
    cd PROJE_ADINIZ.wiki
    ```
    Artık wiki'nin yerel bir kopyası içindesiniz.

---

### Adım 2: Dosyaları Kopyalama

1.  Bu projedeki `wiki` klasörünün içinde bulunan tüm `.md` dosyalarını, az önce klonladığınız `PROJE_ADINIZ.wiki` klasörünün içine kopyalayın.
2.  Kopyalama işlemi tamamlandığında, `PROJE_ADINIZ.wiki` klasörünün içinde aşağıdaki gibi bir yapı olmalıdır:
    ```
    PROJE_ADINIZ.wiki/
    ├── Home.md  (varsayılan olarak gelir)
    ├── _Sidebar.md
    ├── user-guide-getting-started.md
    ├── user-guide-features.md
    ├── user-guide-troubleshooting.md
    ├── dev-guide-setup.md
    ├── dev-guide-architecture.md
    ├── dev-guide-backend-api.md
    ├── dev-guide-frontend.md
    ├── dev-guide-database-schema.md
    └── dev-guide-testing.md
    ```

---

### Adım 3: Değişiklikleri Gönderme (Push)

1.  `PROJE_ADINIZ.wiki` klasörünün içindeyken, yeni dosyaları Git'e ekleyin, bir commit oluşturun ve değişiklikleri GitHub'a gönderin.
    ```bash
    git add .
    git commit -m "Wiki dokümantasyonunu ekle"
    git push
    ```

---

### Adım 4: Kontrol Etme

Değişiklikleri gönderdikten sonra, GitHub'daki projenizin "Wiki" sekmesine geri dönün. Sayfayı yenilediğinizde, sağ tarafta `_Sidebar.md` dosyasının oluşturduğu navigasyon menüsünü ve "Pages" listesinde tüm yeni sayfaları görmelisiniz.

Bağlantıların doğru çalıştığından ve sayfaların düzgün göründüğünden emin olmak için menüdeki birkaç linke tıklayın.

Hepsi bu kadar! Wiki'niz artık hem kullanıcılar hem de geliştiriciler için kapsamlı dokümantasyona sahip.
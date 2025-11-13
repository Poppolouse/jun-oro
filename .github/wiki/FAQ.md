# ❓ Sıkça Sorulan Sorular (SSS)

Jun-Oro oyun kütüphanesi yönetim platformu hakkında sıkça sorulan sorular ve cevapları.

## 📋 İçindekiler

- [Genel Sorular](#genel-sorular)
- [Kurulum ve Kurulum](#kurulum-ve-kurulum)
- [Oyun Kütüphanesi](#oyun-kütüphanesi)
- [Steam Entegrasyonu](#steam-entegrasyonu)
- [IGDB Entegrasyonu](#igdb-entegrasyonu)
- [Oturum Takibi](#oturum-takibi)
- [İstek Listesi](#istek-listesi)
- [İstatistikler ve Analiz](#istatistikler-ve-analiz)
- [Teknik Sorular](#teknik-sorular)
- [Gizlilik ve Güvenlik](#gizlilik-ve-güvenlik)
- [Mobil Kullanım](#mobil-kullanım)

---

## 🌟 Genel Sorular

### Jun-Oro nedir?

Jun-Oro, oyun kütüphanenizi yönetmek için tasarlanmış modern bir web uygulamasıdır. Steam ve IGDB entegrasyonları ile oyunlarınızı kolayca ekleyebilir, oyun sürelerinizi takip edebilir, istek listenizi oluşturabilir ve oyun istatistiklerinizi analiz edebilirsiniz.

### Jun-Oro ücretsiz mi?

Evet, Jun-Oro tamamen ücretsiz ve açık kaynaklı bir projedir. Hiçbir ücret veya abonelik gerektirmez.

### Hangi platformları destekliyor?

Jun-Oro şu anda web tabanlıdır ve tüm modern tarayıcılarda çalışır:

- Chrome (v90+)
- Firefox (v88+)
- Safari (v14+)
- Edge (v90+)

### Verilerim nerede saklanıyor?

Tüm verileriniz kendi sunucunuzda güvenli bir şekilde saklanır. Jun-Oro, verilerinizi hiçbir üçüncü parti hizmetle paylaşmaz.

---

## 🛠️ Kurulum ve Kurulum

### Jun-Oro'yu nasıl kurarım?

Detaylı kurulum talimatları için [Getting Started](Getting-Started) sayfasını ziyaret edin. Temel adımlar:

1. Node.js 18+ kurun
2. Repoyu klonlayın
3. `npm install` çalıştırın
4. Environment değişkenlerini yapılandırın
5. `npm run dev` ile başlatın

### Sistem gereksinimleri nelerdir?

**Minimum Gereksinimler:**

- Node.js 18+
- PostgreSQL 12+
- 2GB RAM
- 1GB disk alanı

**Tavsiye Edilen:**

- Node.js 20+
- PostgreSQL 14+
- 4GB RAM
- 5GB disk alanı

### Docker ile kurulum yapabilir miyim?

Evet, Jun-Oro Docker ile kurulumu destekler. Detaylı bilgi için [Deployment](Deployment) sayfasını inceleyin.

---

## 🎮 Oyun Kütüphanesi

### Oyunları nasıl ekleyebilirim?

Jun-Oro'ya oyun eklemenin üç yolu vardır:

1. **Manuel Ekleme:** Oyun bilgilerini manuel olarak girin
2. **Steam Import:** Steam kütüphanenizi otomatik olarak içe aktarın
3. **IGDB Arama:** IGDB veritabanından oyun arayıp ekleyin

Detaylı bilgi için [Library Management](Library-Management) sayfasını ziyaret edin.

### Oyun kapak görsellerini nasıl eklerim?

Oyun eklerken IGDB entegrasyonu otomatik olarak kapak görsellerini çeker. Manuel olarak eklemek için:

1. Oyun düzenleme sayfasını açın
2. "Kapak Görseli" bölümüne gelin
3. Yeni görsel yükleyin
4. Değişiklikleri kaydedin

### Oyunları nasıl kategorize edebilirim?

Her oyun için kategori ve etiketler belirleyebilirsiniz:

1. Oyun düzenleme sayfasını açın
2. "Kategoriler" bölümünden mevcut kategorileri seçin
3. "Etiketler" bölümüne özel etiketler ekleyin
4. Kaydet butonuna tıklayın

### Oyun bilgilerini nasıl toplu olarak düzenleyebilirim?

Kütüphane sayfasında toplu düzenleme özelliğini kullanabilirsiniz:

1. Düzenlemek istediğiniz oyunları seçin (checkbox'lar)
2. "Toplu Düzenle" butonuna tıklayın
3. Değiştirmek istediğiniz alanları güncelleyin
4. "Uygula" butonuna tıklayın

---

## 🚂 Steam Entegrasyonu

### Steam kütüphanemi nasıl içe aktarabilirim?

Steam kütüphanizi içe aktarmak için:

1. Ayarlar sayfasına gidin
2. "Entegrasyonlar" bölümünü seçin
3. Steam API key'inizi girin
4. Steam profil URL'nizi ekleyin
5. "Steam Kütüphanesini İçe Aktar" butonuna tıklayın

### Steam API key nasıl alırım?

Steam Web API key almak için:

1. [Steam Web API Anahtarları](https://steamcommunity.com/dev/apikey) sayfasını ziyaret edin
2. Gerekli bilgileri doldurun
3. Domain olarak kendi sunucu adresinizi girin
4. API key'inizi kopyalayın

### Steam profilimi public yapmalı mıyım?

Evet, Steam kütüphanenizi içe aktarabilmek için Steam profilinizin "Game Details" bölümünün public olması gerekir.

### Steam import neden çalışmıyor?

Steam import sorunları için:

1. API key'inizin doğru olduğundan emin olun
2. Steam profilinizin public olduğunu kontrol edin
3. Steam profil URL'nizin doğru formatta olduğundan emin olun
4. Steam API rate limit'lerini aşıp aşmadığınızı kontrol edin

---

## 🎯 IGDB Entegrasyonu

### IGDB nedir ve neden kullanılıyor?

IGDB (Internet Game Database), oyunlar hakkında kapsamlı bilgi sağlayan bir veritabanıdır. Jun-Oro, IGDB'yi kullanarak:

- Oyun bilgilerini otomatik olarak çeker
- Kapak görsellerini ve ekran görüntülerini alır
- Oyun açıklamalarını ve özelliklerini getirir
- Oyun puanlarını ve değerlendirmelerini gösterir

### IGDB API key nasıl alırım?

IGDB API key almak için:

1. [IGDB](https://www.igdb.com/) sitesinde hesap oluşturun
2. Geliştirici portalına gidin
3. Yeni bir uygulama oluşturun
4. Client ID ve Client Secret'i kopyalayın

### IGDB arama sonuçları boş geliyor?

IGDB arama sorunları için:

1. Arama teriminin en az 3 karakter içerdiğinden emin olun
2. İngilizce arama terimleri kullanmayı deneyin
3. API key'inizin geçerli olduğunu kontrol edin
4. Rate limit'leri aşıp aşmadığınızı kontrol edin

---

## ⏱️ Oturum Takibi

### Oyun oturumu nasıl başlatırım?

Oyun oturumu başlatmak için:

1. Kütüphanenizden oyunu seçin
2. "Oyunu Başlat" butonuna tıklayın
3. Oturum başladığında zamanlayıcı otomatik başlar
4. Oyun bittiğinde "Oyunu Bitir" butonuna tıklayın

### Oturumları nasıl düzenleyebilirim?

Oturumlarınızı yönetmek için:

1. "Oturumlar" sayfasına gidin
2. Düzenlemek istediğiniz oturumu seçin
3. Başlangıç/bitiş saatlerini, notları veya diğer bilgileri güncelleyin
4. Değişiklikleri kaydedin

### Kampanya takibi nasıl çalışır?

Kampanya takibi ile uzun oyunları bölümlere ayırabilirsiniz:

1. Oyun için yeni kampanya oluşturun
2. Kampanyaya bölümler ekleyin
3. Her bölüm için ayrı oturumlar başlatın
4. Kampanya ilerlemesini grafiklerde görüntüleyin

Detaylı bilgi için [Session Tracking](Session-Tracking) sayfasını inceleyin.

---

## 📝 İstek Listesi

### İstek listesi nasıl oluştururum?

İstek listesi oluşturmak için:

1. "İstek Listesi" sayfasına gidin
2. "Oyun Ekle" butonuna tıklayın
3. IGDB'den veya manuel olarak oyun bilgilerini girin
4. Oyunu istek listenize ekleyin

### Fiyat takibi nasıl çalışır?

Fiyat takibi özelliği ile oyunların fiyat değişimlerini izleyebilirsiniz:

1. İstek listenizdeki oyun için fiyat takibini etkinleştirin
2. Platformları seçin (Steam, Epic Games, vb.)
3. Fiyat düşüşü olduğunda bildirim alın
4. Fiyat geçmişini grafiklerde görüntüleyin

### Fiyat bildirimlerini nasıl alırım?

Fiyat bildirimleri için:

1. Ayarlar sayfasında bildirimleri etkinleştirin
2. Email bildirimlerini yapılandırın
3. Browser bildirimlerine izin verin
4. Fiyat eşik değerlerini ayarlayın

---

## 📊 İstatistikler ve Analiz

### Hangi istatistikleri görebilirim?

Jun-Oro size kapsamlı istatistikler sunar:

- **Toplam Oyun Süresi:** Tüm oyunlarda harcadığınız süre
- **Oyun Tamamlama Oranları:** Başladığınız oyunları bitirme yüzdesi
- **Platform Dağılımı:** Hangi platformlarda ne kadar süre harcadığınız
- **Tür Analizi:** En sevdiğiniz oyun türleri
- **Aylık/Yıllık Raporlar:** Zaman içindeki oyun alışkanlıklarınız

### İstatistikleri nasıl dışa aktarabilirim?

İstatistiklerinizi dışa aktarmak için:

1. "İstatistikler" sayfasına gidin
2. "Dışa Aktar" butonuna tıklayın
3. Format seçin (CSV, JSON, PDF)
4. İndir butonuna tıklayın

### Verilerimi nasıl görselleştirebilirim?

Jun-Oro otomatik olarak verilerinizi görselleştirir:

- Çizgi grafikler (zaman içindeki ilerleme)
- Pasta grafikler (kategori dağılımı)
- Çubuk grafikler (platform karşılaştırması)
- Heat map'ler (oyun yoğunluğu)

---

## 🔧 Teknik Sorular

### API limitleri nelerdir?

**Steam API:**

- 100,000 çağrı/gün
- Rate limit: Aşırı kullanımda geçici blok

**IGDB API:**

- 4 istek/saniye
- 8,000 istek/saat
- Aylık limit: API planına bağlı

### Verilerimi nasıl yedekleyebilirim?

Veri yedekleme seçenekleri:

1. **Otomatik Yedekleme:** Ayarlarda otomatik yedeklemeyi yapılandırın
2. **Manuel Yedekleme:** Ayarlar > "Veri Yedekle" bölümünü kullanın
3. **Database Export:** PostgreSQL export komutlarını kullanın

### Self-hosting seçenekleri nelerdir?

Jun-Oro'yu kendi sunucunuzda barındırabilirsiniz:

- **VPS:** DigitalOcean, Linode, Vultr
- **Cloud:** AWS, Google Cloud, Azure
- **Docker:** Container ile deployment
- **PaaS:** Heroku, Railway

Detaylı bilgi için [Deployment](Deployment) sayfasını inceleyin.

---

## 🔒 Gizlilik ve Güvenlik

### Verilerim güvende mi?

Evet, Jun-Oro veri güvenliğine önem verir:

- Tüm veriler sizin sunucunuzda saklanır
- HTTPS ile şifreli iletişim
- JWT tabanlı kimlik doğrulama
- Regular security updates

### Verilerimi nasıl silebilirim?

Verilerinizi tamamen silmek için:

1. Ayarlar sayfasına gidin
2. "Hesabı Sil" bölümünü bulun
3. Onay kodunu girin
4. "Hesabı Sil" butonuna tıklayın

### GDPR uyumluluğu nasıl sağlanıyor?

Jun-Oro GDPR uyumludur:

- Veri minimalizasyonu
- Açık rıza
- Veri portability (export)
- Unutulma hakkı (silme)
- Şeffaflık raporları

---

## 📱 Mobil Kullanım

### Jun-Oro mobilde çalışır mı?

Jun-Oro responsive tasarıma sahiptir ve mobil cihazlarda çalışır, ancak:

- **En İyi Deneyim:** Masaüstü tarayıcılar
- **Mobil Destek:** Temel işlevler kullanılabilir
- **Tablet:** İyi kullanıcı deneyimi

### Mobil uygulaması olacak mı?

Şu anda mobil uygulama planlanmamıştır, ancak gelecekte düşünülebilir. Progressive Web App (PWA) özellikleri üzerinde çalışıyoruz.

### Mobilde oturum takibi nasıl yapılır?

Mobilde oturum takibi için:

1. Mobil tarayıcıda Jun-Oro'yu açın
2. Oyunu başlatın
3. Telefonu kapatmayın (background'da çalışır)
4. Oyun bittiğinde tekrar açıp bitirin

---

## 🔗 İlgili Sayfalar

- [Home](Home) - Wiki ana sayfası
- [Getting Started](Getting-Started) - Kurulum rehberi
- [User Guide](User-Guide) - Kullanıcı rehberi
- [Library Management](Library-Management) - Kütüphane yönetimi
- [Session Tracking](Session-Tracking) - Oturum takibi
- [Wishlist](Wishlist) - İstek listesi
- [Statistics](Statistics) - İstatistikler
- [Troubleshooting](Troubleshooting) - Sorun giderme
- [Developer Guide](Developer-Guide) - Geliştirici rehberi

---

## 🏷️ Etiketler

`faq` `sıkça-sorulan-sorular` `yardım` `destek` `sorun-çözümü` `kullanım` `özellikler`

---

## 💡 Ek Kaynaklar

- [Video Tutorials](https://youtube.com/playlist) - Video eğitim serileri
- [Community Forum](https://forum.jun-oro.com) - Kullanıcı forumu
- [Discord Server](https://discord.gg/jun-oro) - Anlık sohbet ve destek
- [GitHub Issues](https://github.com/username/jun-oro/issues) - Hata bildirimi
- [Blog](https://blog.jun-oro.com) - İpuçları ve haberler

---

## 📞 Daha Fazla Yardım İçin

Yardıma ihtiyacınız olursa:

1. **📖 Dokümantasyon:** Wiki sayfalarını inceleyin
2. **🔍 Arama:** Wiki'de arama yapın
3. **💬 Community:** Discord veya forumda sorun
4. **🐛 Hata Bildir:** GitHub issue oluşturun
5. **📧 Email:** support@jun-oro.com

---

## 🔄 Son Güncelleme

Bu SSS sayfası son olarak 10 Kasım 2025'te güncellenmiştir. En güncel bilgiler için [Changelog](https://github.com/username/jun-oro/blob/main/CHANGELOG.md) sayfasını kontrol edin.

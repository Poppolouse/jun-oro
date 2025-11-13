# Arkade Uygulaması Durum Raporu

Bu rapor, projedeki "Arkade" özelliğinin mevcut durumunu, tamamlanmamış kısımlarını ve genel yapısını özetlemektedir.

## 1. Genel Bakış

Arkade, oyun kütüphanesi yönetimi ve oyun oturumu takibi için tasarlanmış bir özelliktir. Modern bir client-server mimarisi kullanılarak geliştirilmiştir. Frontend tarafında **React**, backend tarafında ise (API yapısından anlaşıldığı üzere) **Node.js/Express** tabanlı bir REST API bulunmaktadır.

Uygulamanın temel amacı, kullanıcıların kendi oyun kütüphanelerini oluşturmalarını, oyunlarını yönetmelerini ve oyun oynarken geçirdikleri süreyi takip etmelerini sağlamaktır.

## 2. Mevcut Çalışma Şekli (İmplemente Edilmiş Özellikler)

- **Oyun Kütüphanesi (`ArkadeLibrary`):**
  - Kullanıcılar kütüphanelerine manuel olarak veya Steam üzerinden oyun ekleyebilir, mevcut oyunların detaylarını düzenleyebilir ve silebilirler.
  - Kütüphane içerisinde arama, sıralama ve filtreleme fonksiyonları aktif olarak çalışmaktadır.
  - Bu özellik, backend ile `services/userLibrary.js` servisi üzerinden haberleşerek tüm CRUD (Oluştur, Oku, Güncelle, Sil) işlemlerini gerçekleştirir.

- **Aktif Oturum Takibi (`ArkadeActiveSession`):**
  - Kullanıcı, kütüphanesindeki bir oyun için "oturum" başlatabilir.
  - Oturum başlatıldığında, `ArkadeActiveSession` sayfasına yönlendirilir ve burada geçen süreyi gösteren bir sayaç çalışır.
  - Oturum durumu (sayaç dahil) sayfa yenilense bile korunur (`localStorage` kullanımı sayesinde).
  - Oturum durdurulduğunda, geçen süre oyunun toplam oynanma süresine eklenir.
  - Bu özellik, `contexts/ActiveSessionContext.jsx` içerisindeki state yönetimi ile kontrol edilmektedir.

## 3. Henüz Yapılmamış veya Eksik Olanlar

Uygulamanın temel iskeleti ve bazı çekirdek fonksiyonları çalışır durumda olsa da, birçok özellik henüz tamamlanmamıştır ve "Çok Yakında" (Coming Soon) olarak işaretlenmiştir.

- **Ana Dashboard (`ArkadeDashboard`):**
  - Bu sayfa tamamen bir yer tutucudan (placeholder) ibarettir. Planlanan istatistikler, aktivite takibi ve başarı sistemi gibi özellikler burada gösterilecektir ancak henüz hiçbirisi implemente edilmemiştir.

- **Gelişmiş Özellikler:**
  - **AI Önerileri, Detaylı Analizler, Sosyal Dashboard'lar, Başarı (Achievement) Sistemi:** Bu özelliklerin tamamı şu anda sadece arayüzde birer maket olarak durmaktadır. Fonksiyonları mevcut değildir.
  - Ancak, `services/api.js` dosyasındaki API tanımlamaları, bu özellikler için backend altyapısının planlandığını veya geliştirilme aşamasında olduğunu göstermektedir.

- **Cycle Planner:**
  - Kütüphane sayfasında bulunan bu özellik henüz tamamlanmamıştır ve şu anki haliyle sadece "admin" kullanıcıları tarafından görülebilmektedir.

## 4. Genel Layout ve UI (Arayüz Tasarımı)

- Uygulama, zengin ve görsel olarak stilize edilmiş bir arayüze sahiptir. Ancak birçok bileşen, henüz implemente edilmemiş özellikler için yer tutucu görevi görmektedir.
- Genel olarak üç ana sayfa düzeni mevcuttur:
  1.  `ArkadeDashboard`: Gelecek özelliklerin tanıtıldığı bir vitrin sayfası.
  2.  `ArkadeLibrary`: Oyunların kartlar veya liste halinde gösterildiği, veri odaklı bir kütüphane arayüzü.
  3.  `ArkadeActiveSession`: Aktif oyun oturumunu ve ilgili kontrolleri (durdur, duraklat vb.) gösteren odaklanmış bir görünüm.

## 5. Teknik Mimari

- **Frontend:** React tabanlıdır ve `components`, `pages`, `services`, `contexts` gibi modern React proje yapılandırma standartlarını takip eder.
- **Veri Katmanı:** `services` klasörü, backend API'si için bir sarmalayıcı (wrapper) görevi görür. `userLibrary.js` kütüphane özellikleri için, `api.js` ise tüm API kontratı için merkezi bir rol oynar.
- **State Yönetimi:** Özellikle oturum takibi için React Context (`ActiveSessionContext`) aktif olarak kullanılmaktadır. Bu context, oturum verilerini ve sayacını yönetir, durumu tarayıcının `localStorage`'ına kaydederek veri kalıcılığı sağlar.
- **Backend:** Frontend'in `api.js` dosyası üzerinden haberleştiği, kullanıcıları, oyunları, kütüphane kayıtlarını ve oturumları yönetmek için kapsamlı REST endpoint'leri sunan bir API'dir.

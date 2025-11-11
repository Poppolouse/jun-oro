import React, { useState, useMemo } from 'react';
import { FaSearch, FaPlus, FaQuestionCircle, FaThumbsUp, FaThumbsDown, FaFilter, FaTimes, FaChevronDown, FaChevronUp, FaStar, FaBook, FaGamepad, FaChartBar, FaCog, FaLink, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Sıkça Sorulan Sorular sayfası component'i
 * @returns {JSX.Element} SSS sayfası
 */
export default function FAQPage() {
  // State yönetimi
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState({});
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [showHelpRequestModal, setShowHelpRequestModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ category: '', question: '', email: '' });
  const [helpRequest, setHelpRequest] = useState({ name: '', email: '', issue: '', description: '' });
  const [lastUpdateDate] = useState(new Date().toLocaleDateString('tr-TR'));

  // Kategorize edilmiş SSS verileri
  const faqData = [
    {
      id: 'getting-started',
      name: 'Başlangıç ve Kurulum',
      icon: FaStar,
      color: 'bg-blue-100 text-blue-600',
      questions: [
        {
          id: 'gs-1',
          question: 'Jun-Oro\'yu nasıl kurabilirim?',
          answer: 'Jun-Oro\'yu kurmak için şu adımları izleyin:\n1. Resmi web sitesinden en son sürümü indirin\n2. Kurulum dosyasını çalıştırın\n3. Ekrandaki talimatları takip edin\n4. Hesabınızla giriş yapın veya yeni bir hesap oluşturun',
          popular: true,
          related: ['gs-2', 'gs-3']
        },
        {
          id: 'gs-2',
          question: 'Hesap oluşturma adımları nelerdir?',
          answer: 'Hesap oluşturmak için:\n1. "Kayıt Ol" butonuna tıklayın\n2. E-posta adresinizi girin\n3. Güçlü bir şifre oluşturun\n4. E-posta doğrulamasını tamamlayın\n5. Profil bilgilerinizi tamamlayın',
          popular: false,
          related: ['gs-1', 'gs-4']
        },
        {
          id: 'gs-3',
          question: 'Profilimi nasıl düzenleyebilirim?',
          answer: 'Profil düzenleme için:\n1. Sağ üst köşedeki profil ikonuna tıklayın\n2. "Profil Ayarları" seçeneğini seçin\n3. İstediğiniz bilgileri güncelleyin\n4. "Değişiklikleri Kaydet" butonuna tıklayın',
          popular: false,
          related: ['gs-2', 'gs-4']
        },
        {
          id: 'gs-4',
          question: 'Arayüzü nasıl kullanabilirim?',
          answer: 'Jun-Oro arayüzü kullanımı:\n1. Sol menüden farklı bölümlere erişebilirsiniz\n2. Ana sayfada genel istatistiklerinizi görürsünüz\n3. Kütüphane bölümünden oyunlarınızı yönetin\n4. İstatistikler bölümünde detaylı analizlere ulaşın',
          popular: true,
          related: ['gs-2', 'gs-3']
        }
      ]
    },
    {
      id: 'library',
      name: 'Kütüphane Yönetimi',
      icon: FaBook,
      color: 'bg-green-100 text-green-600',
      questions: [
        {
          id: 'lib-1',
          question: 'Oyun nasıl ekleyebilirim?',
          answer: 'Oyun ekleme yöntemleri:\n1. Manuel ekleme: "Oyun Ekle" butonuna tıklayın\n2. Steam import: Steam hesabınızı bağlayın\n3. IGDB entegrasyonu: Oyun verilerini otomatik çekin\n4. Barkod tarama: Fiziksel kopyaları tarayın',
          popular: true,
          related: ['lib-2', 'lib-3']
        },
        {
          id: 'lib-2',
          question: 'Steam kütüphanemi nasıl aktarabilirim?',
          answer: 'Steam kütüphanesi aktarımı:\n1. Ayarlar bölümüne gidin\n2. "Entegrasyonlar" sekmesini açın\n3. Steam API anahtarınızı girin\n4. "Kütüphaneyi İçe Aktar" butonuna tıklayın\n5. İşlem tamamlandığında bildirim alacaksınız',
          popular: true,
          related: ['lib-1', 'lib-6']
        },
        {
          id: 'lib-3',
          question: 'Oyun bilgilerini nasıl düzenleyebilirim?',
          answer: 'Oyun düzenleme:\n1. Kütüphanede oyunu bulun\n2. Oyun kartına tıklayın\n3. "Düzenle" butonuna basın\n4. İstediğiniz alanları güncelleyin\n5. "Kaydet" butonuna tıklayın',
          popular: false,
          related: ['lib-1', 'lib-4']
        },
        {
          id: 'lib-4',
          question: 'Oyunları nasıl kategorize edebilirim?',
          answer: 'Oyun kategorizasyonu:\n1. Oyun detay sayfasına gidin\n2. "Kategoriler" bölümünü açın\n3. Mevcut kategorileri seçin veya yeni oluşturun\n4. Etiketler ekleyerek daha detaylı sınıflandırma yapın\n5. Değişiklikleri kaydedin',
          popular: false,
          related: ['lib-3', 'lib-5']
        },
        {
          id: 'lib-5',
          question: 'Oyun silme nasıl yapılır?',
          answer: 'Oyun silme işlemi:\n1. Silmek istediğiniz oyunu bulun\n2. Oyun kartındaki "..." menüsüne tıklayın\n3. "Sil" seçeneğini seçin\n4. Onay dialogunda "Evet, Sil" butonuna tıklayın\n5. Not: Silinen oyunlar geri yüklenemez',
          popular: false,
          related: ['lib-3', 'lib-4']
        },
        {
          id: 'lib-6',
          question: 'IGDB entegrasyonu nasıl çalışır?',
          answer: 'IGDB entegrasyonu:\n1. Ayarlar > Entegrasyonlar > IGDB\n2. API anahtarınızı girin\n3. Otomatik veri senkronizasyonunu açın\n4. Oyun ekleme sırasında IGDB verileri otomatik çekilir\n5. Kapak resimleri, açıklamalar ve puanlar güncellenir',
          popular: true,
          related: ['lib-1', 'lib-2']
        }
      ]
    },
    {
      id: 'sessions',
      name: 'Oyun ve Oturumlar',
      icon: FaGamepad,
      color: 'bg-purple-100 text-purple-600',
      questions: [
        {
          id: 'ses-1',
          question: 'Oyun oturumu nasıl başlatılır?',
          answer: 'Oyun oturumu başlatma:\n1. Kütüphaneden oynamak istediğiniz oyunu seçin\n2. "Oyunu Başlat" butonuna tıklayın\n3. Oturum türünü seçin (ana kampanya, çok oyunculu vb.)\n4. Başlangıç zamanı otomatik kaydedilir\n5. Oyunu bitirdiğinizde oturumu kapatın',
          popular: true,
          related: ['ses-2', 'ses-3']
        },
        {
          id: 'ses-2',
          question: 'Oyun süresi nasıl takip edilir?',
          answer: 'Oyun süresi takibi:\n1. Oturum başladığında zamanlayıcı otomatik çalışır\n2. Arka planda çalışmaya devam eder\n3. Oyun kapatıldığında süre kaydedilir\n4. İstatistikler bölümünde detaylı analizleri görüntüleyin\n5. Manuel süre düzenleme de mümkündür',
          popular: true,
          related: ['ses-1', 'ses-4']
        },
        {
          id: 'ses-3',
          question: 'Kampanya yönetimi nasıl yapılır?',
          answer: 'Kampanya yönetimi:\n1. Oyun detay sayfasında "Kampanyalar" sekmesini açın\n2. Yeni kampanya oluşturun\n3. Bölümleri ve ilerlemeyi takip edin\n4. Tamamlanan bölümleri işaretleyin\n5. Kampanya istatistiklerini görüntüleyin',
          popular: false,
          related: ['ses-1', 'ses-5']
        },
        {
          id: 'ses-4',
          question: 'Oyun istatistikleri nerede görüntülenir?',
          answer: 'Oyun istatistikleri:\n1. İstatistikler bölümüne gidin\n2. "Oyun İstatistikleri" sekmesini seçin\n3. Toplam oyun süresini görüntüleyin\n4. En çok oynanan oyunları listesini inceleyin\n5. Aylık/yıllık analizleri kontrol edin',
          popular: false,
          related: ['ses-2', 'ses-6']
        },
        {
          id: 'ses-5',
          question: 'Çoklu oturum yönetimi nasıl yapılır?',
          answer: 'Çoklu oturum yönetimi:\n1. Aynı anda birden fazla oturum başlatabilirsiniz\n2. Her oturum ayrı olarak takip edilir\n3. Oturumlar arasında geçiş yapabilirsiniz\n4. Aktif oturmları panelde görüntüleyin\n5. İstediğiniz zaman durdurup devam edebilirsiniz',
          popular: false,
          related: ['ses-1', 'ses-3']
        },
        {
          id: 'ses-6',
          question: 'Oyun geçmişi nasıl görüntülenir?',
          answer: 'Oyun geçmişi görüntüleme:\n1. Profil sayfasına gidin\n2. "Oyun Geçmişi" bölümünü açın\n3. Tüm oturumları kronolojik olarak görüntüleyin\n4. Filtreleme seçeneklerini kullanın\n5. Detaylı oturum bilgilerini inceleyin',
          popular: false,
          related: ['ses-2', 'ses-4']
        }
      ]
    },
    {
      id: 'stats',
      name: 'İstatistikler ve Raporlar',
      icon: FaChartBar,
      color: 'bg-orange-100 text-orange-600',
      questions: [
        {
          id: 'stat-1',
          question: 'Genel oyun istatistiklerimi nasıl görüntüleyebilirim?',
          answer: 'Genel istatistik görüntüleme:\n1. Ana sayfadaki "İstatistikler" kartına bakın\n2. Toplam oyun süresini görüntüleyin\n3. Oyun sayısını kontrol edin\n4. Tamamlanan oyun oranını inceleyin\n5. Detaylı analiz için İstatistikler sayfasına gidin',
          popular: true,
          related: ['stat-2', 'stat-3']
        },
        {
          id: 'stat-2',
          question: 'Oyun tamamlama oranları nasıl hesaplanır?',
          answer: 'Tamamlama oranı hesaplama:\n1. Tamamlanan oyun sayısı / Toplam oyun sayısı\n2. Ana kampanya biten oyunlar dikkate alınır\n3. Yüzde olarak otomatik hesaplanır\n4. İstatistikler sayfasında detaylı tabloyu görüntüleyin\n5. Kategori bazında filtreleme yapabilirsiniz',
          popular: false,
          related: ['stat-1', 'stat-4']
        },
        {
          id: 'stat-3',
          question: 'Zaman analizi raporları nasıl oluşturulur?',
          answer: 'Zaman analizi raporları:\n1. İstatistikler > Zaman Analizi bölümüne gidin\n2. Tarih aralığı seçin\n3. Günlük/haftalık/aylık görünümler seçin\n4. Grafikleri inceleyin\n5. Raporu dışa aktarabilirsiniz',
          popular: false,
          related: ['stat-1', 'stat-5']
        },
        {
          id: 'stat-4',
          question: 'Başarı ve tamamlama istatistikleri nerede?',
          answer: 'Başarı istatistikleri:\n1. Oyun detay sayfasında "Başarılar" sekmesi\n2. Genel başarı oranını görüntüleyin\n3. Kilitli/kilitlenmemiş başarıları listeleyin\n4. Zorluk seviyesine göre filtreleme yapın\n5. Başırım zaman çizelgesini inceleyin',
          popular: false,
          related: ['stat-2', 'stat-6']
        },
        {
          id: 'stat-5',
          question: 'Raporları nasıl dışa aktarabilirim?',
          answer: 'Rapor dışa aktarma:\n1. İstediğiniz raporu açın\n2. "Dışa Aktar" butonuna tıklayın\n3. Format seçin (PDF, Excel, CSV)\n4. İndirme işlemini başlatın\n5. E-posta ile gönderme seçeneği de mevcut',
          popular: false,
          related: ['stat-3', 'stat-6']
        },
        {
          id: 'stat-6',
          question: 'Karşılaştırma raporları nasıl oluşturulur?',
          answer: 'Karşılaştırma raporları:\n1. İstatistikler > Karşılaştırma bölümüne gidin\n2. Karşılaştırmak istediğiniz oyunları seçin\n3. Zaman aralığı belirleyin\n4. Metrikleri seçin (süre, tamamlama vb.)\n5. Karşılaştırma grafiğini oluşturun',
          popular: false,
          related: ['stat-4', 'stat-5']
        }
      ]
    },
    {
      id: 'settings',
      name: 'Ayarlar ve Tercihler',
      icon: FaCog,
      color: 'bg-gray-100 text-gray-600',
      questions: [
        {
          id: 'set-1',
          question: 'Hesap ayarlarımı nasıl değiştirebilirim?',
          answer: 'Hesap ayarları:\n1. Sağ üst köşedeki profil ikonuna tıklayın\n2. "Hesap Ayarları" seçeneğini seçin\n3. İstediğiniz ayarları güncelleyin\n4. E-posta, şifre, bildirim tercihleri\n5. "Kaydet" butonuna tıklayın',
          popular: true,
          related: ['set-2', 'set-3']
        },
        {
          id: 'set-2',
          question: 'Profil bilgilerimi nasıl güncelleyebilirim?',
          answer: 'Profil bilgileri güncelleme:\n1. Profil sayfasına gidin\n2. "Profili Düzenle" butonuna tıklayın\n3. Ad, soyad, kullanıcı adı gibi bilgileri güncelleyin\n4. Profil fotoğrafını değiştirin\n5. "Değişiklikleri Kaydet" butonuna tıklayın',
          popular: false,
          related: ['set-1', 'set-4']
        },
        {
          id: 'set-3',
          question: 'Şifremi nasıl değiştirebilirim?',
          answer: 'Şifre değiştirme:\n1. Ayarlar > Güvenlik bölümüne gidin\n2. "Şifre Değiştir" butonuna tıklayın\n3. Mevcut şifrenizi girin\n4. Yeni şifrenizi belirleyin\n5. Onay için tekrar girin ve kaydedin',
          popular: false,
          related: ['set-1', 'set-5']
        },
        {
          id: 'set-4',
          question: 'Bildirim ayarları nasıl yönetilir?',
          answer: 'Bildirim ayarları:\n1. Ayarlar > Bildirimler bölümüne gidin\n2. E-posta bildirimlerini aç/kapat\n3. Tarayıcı bildirimlerini yönet\n4. Bildirim türlerini seçin\n5. Sıklık ayarlarını belirle',
          popular: false,
          related: ['set-2', 'set-6']
        },
        {
          id: 'set-5',
          question: 'Gizlilik ayarları nerede bulunur?',
          answer: 'Gizlilik ayarları:\n1. Ayarlar > Gizlilik bölümüne gidin\n2. Profil görünürlüğünü ayarlayın\n3. Veri paylaşım tercihlerini belirleyin\n4. Çerez ayarlarını yönetin\n5. Hesap silme seçeneklerini görüntüleyin',
          popular: false,
          related: ['set-3', 'set-6']
        },
        {
          id: 'set-6',
          question: 'Tema ve görünüm ayarları nasıl yapılır?',
          answer: 'Tema ve görünüm:\n1. Ayarlar > Görünüm bölümüne gidin\n2. Tema seçin (açık/koyu/otomatik)\n3. Font boyutunu ayarlayın\n4. Renk tercihlerini belirleyin\n5. Değişiklikleri kaydedin',
          popular: false,
          related: ['set-4', 'set-5']
        }
      ]
    },
    {
      id: 'integrations',
      name: 'Entegrasyonlar',
      icon: FaLink,
      color: 'bg-indigo-100 text-indigo-600',
      questions: [
        {
          id: 'int-1',
          question: 'Steam hesabımı nasıl bağlayabilirim?',
          answer: 'Steam hesabı bağlama:\n1. Ayarlar > Entegrasyonlar > Steam\n2. "Steam Hesabını Bağla" butonuna tıklayın\n3. Steam giriş sayfasına yönlendirileceksiniz\n4. Giriş yapın ve izin verin\n5. Bağlantı başarılı olduğunda bildirim alacaksınız',
          popular: true,
          related: ['int-2', 'int-3']
        },
        {
          id: 'int-2',
          question: 'IGDB API anahtarı nasıl alınır?',
          answer: 'IGDB API anahtarı alma:\n1. IGDB web sitesine gidin\n2. Geliştirici hesabı oluşturun\n3. Yeni uygulama kaydedin\n4. API anahtarınızı kopyalayın\n5. Jun-Oro ayarlarındaki ilgili alana yapıştırın',
          popular: false,
          related: ['int-1', 'int-4']
        },
        {
          id: 'int-3',
          question: 'Diğer platformlarla entegrasyon nasıl yapılır?',
          answer: 'Diğer platform entegrasyonları:\n1. Ayarlar > Entegrasyonlar bölümüne gidin\n2. Desteklenen platformları listesinden seçin\n3. Gerekli API anahtarlarını girin\n4. Bağlantıyı test edin\n5. Veri senkronizasyonunu başlatın',
          popular: false,
          related: ['int-1', 'int-5']
        },
        {
          id: 'int-4',
          question: 'Otomatik veri senkronizasyonu nasıl çalışır?',
          answer: 'Otomatik veri senkronizasyonu:\n1. Entegrasyon ayarlarından otomatik senkronizasyonu açın\n2. Senkronizasyon sıklığını belirleyin\n3. Hangi verilerin senkronize edileceğini seçin\n4. Arka planda düzenli olarak çalışır\n5. Değişiklikler otomatik olarak güncellenir',
          popular: false,
          related: ['int-2', 'int-6']
        },
        {
          id: 'int-5',
          question: 'Entegrasyon hataları nasıl çözülür?',
          answer: 'Entegrasyon hata çözümü:\n1. API anahtarınızı kontrol edin\n2. İnternet bağlantınızı test edin\n3. Platform servis durumunu kontrol edin\n4. Jun-Oro güncellemelerini kontrol edin\n5. Destek ekibiyle iletişime geçin',
          popular: false,
          related: ['int-3', 'int-4']
        },
        {
          id: 'int-6',
          question: 'Veri dışa aktarma nasıl yapılır?',
          answer: 'Veri dışa aktarma:\n1. Ayarlar > Veri Yönetimi bölümüne gidin\n2. "Veri Dışa Aktar" seçeneğini seçin\n3. Dışa aktarmak istediğiniz verileri seçin\n4. Format belirleyin (JSON, CSV)\n5. İndirme işlemini başlatın',
          popular: false,
          related: ['int-4', 'int-5']
        }
      ]
    },
    {
      id: 'security',
      name: 'Güvenlik ve Gizlilik',
      icon: FaShieldAlt,
      color: 'bg-red-100 text-red-600',
      questions: [
        {
          id: 'sec-1',
          question: 'Hesabımı nasıl güvende tutabilirim?',
          answer: 'Hesap güvenliği:\n1. Güçlü ve benzersiz şifre kullanın\n2. İki faktörlü kimlik doğrulamayı açın\n3. Şifrenizi düzenli olarak değiştirin\n4. Şüpheli aktiviteleri bildirin\n5. Güvenlik ayarlarınızı düzenli kontrol edin',
          popular: true,
          related: ['sec-2', 'sec-3']
        },
        {
          id: 'sec-2',
          question: 'İki faktörlü kimlik doğrulama nasıl kurulur?',
          answer: '2FA kurulumu:\n1. Ayarlar > Güvenlik > İki Faktörlü Doğrulama\n2. "2FA\'yı Etkinleştir" butonuna tıklayın\n3. QR kodu kimlik doğrulama uygulamasıyla tarayın\n4. Onay kodunu girin\n5. Kurtarma kodlarınızı güvenli bir yere kaydedin',
          popular: false,
          related: ['sec-1', 'sec-4']
        },
        {
          id: 'sec-3',
          question: 'Verilerim nasıl korunuyor?',
          answer: 'Veri koruması:\n1. Tüm veriler SSL şifrelemesi ile korunur\n2. Sunucular güvenli veri merkezlerinde barındırılır\n3. Düzenli olarak yedeklenir\n4. GDPR uyumlu işlenir\n5. İsteğiniz üzerine verileriniz silinebilir',
          popular: false,
          related: ['sec-1', 'sec-5']
        },
        {
          id: 'sec-4',
          question: 'Şifremi unuttuysam ne yapmalıyım?',
          answer: 'Şifre sıfırlama:\n1. Giriş sayfasında "Şifremi Unuttum" tıklayın\n2. E-posta adresinizi girin\n3. Gelen kutunuzu kontrol edin\n4. Şifre sıfırlama linkine tıklayın\n5. Yeni şifrenizi belirleyin',
          popular: false,
          related: ['sec-2', 'sec-6']
        },
        {
          id: 'sec-5',
          question: 'Gizlilik politikası nerede bulunur?',
          answer: 'Gizlilik politikası:\n1. Sayfanın altındaki "Gizlilik Politikası" linkine tıklayın\n2. Ayarlar > Gizlilik bölümünden de erişilebilir\n3. Veri toplama ve kullanım hakkında detaylı bilgi\n4. Çerez politikası ve kullanıcı hakları\n5. İletişim bilgileri ve sorular',
          popular: false,
          related: ['sec-3', 'sec-6']
        },
        {
          id: 'sec-6',
          question: 'Hesabımı nasıl silebilirim?',
          answer: 'Hesap silme:\n1. Ayarlar > Hesap > Hesabı Sil\n2. Nedeninizi belirtin\n3. Şifrenizi doğrulayın\n4. "Hesabı Sil" butonuna tıklayın\n5. Not: Bu işlem geri alınamaz',
          popular: false,
          related: ['sec-4', 'sec-5']
        }
      ]
    },
    {
      id: 'technical',
      name: 'Teknik Sorunlar',
      icon: FaExclamationTriangle,
      color: 'bg-yellow-100 text-yellow-600',
      questions: [
        {
          id: 'tech-1',
          question: 'Sayfa yüklenmiyor ne yapmalıyım?',
          answer: 'Sayfa yükleme sorunları:\n1. Tarayıcı önbelleğini temizleyin\n2. Tarayıcınızı güncelleyin\n3. İnternet bağlantınızı kontrol edin\n4. Adblocker\'ı geçici olarak devre dışı bırakın\n5. Farklı bir tarayıcı deneyin',
          popular: true,
          related: ['tech-2', 'tech-3']
        },
        {
          id: 'tech-2',
          question: 'Oyun verileri senkronize olmuyor',
          answer: 'Senkronizasyon sorunları:\n1. İnternet bağlantınızı kontrol edin\n2. API anahtarlarınızı doğrulayın\n3. Entegrasyon ayarlarını kontrol edin\n4. Manuel senkronizasyonu deneyin\n5. Destek ekibiyle iletişime geçin',
          popular: false,
          related: ['tech-1', 'tech-4']
        },
        {
          id: 'tech-3',
          question: 'Performans sorunları yaşıyorum',
          answer: 'Performans sorunları:\n1. Tarayıcı önbelleğini temizleyin\n2. Gereksiz sekmeleri kapatın\n3. Tarayıcı eklentilerini devre dışı bırakın\n4. Bilgisayarınızı yeniden başlatın\n5. Sistem gereksinimlerini kontrol edin',
          popular: false,
          related: ['tech-1', 'tech-5']
        },
        {
          id: 'tech-4',
          question: 'Mobil uyumluluk sorunları',
          answer: 'Mobil uyumluluk:\n1. Mobil tarayıcınızı güncelleyin\n2. Sayfayı yeniden yükleyin\n3. Mobil görünümde gezinmeyi deneyin\n4. Uygulama sürümünü kontrol edin\n5. Ekran çözünürlüğünü ayarlayın',
          popular: false,
          related: ['tech-2', 'tech-6']
        },
        {
          id: 'tech-5',
          question: 'Tarayıcı uyumluluğu sorunları',
          answer: 'Tarayıcı uyumluluğu:\n1. Desteklenen tarayıcıları kontrol edin\n2. Chrome, Firefox, Safari, Edge önerilir\n3. Tarayıcınızı en son sürüme güncelleyin\n4. JavaScript\'in etkin olduğundan emin olun\n5. Çerezlere izin verin',
          popular: false,
          related: ['tech-3', 'tech-6']
        },
        {
          id: 'tech-6',
          question: 'Hata raporu nasıl gönderilir?',
          answer: 'Hata raporu gönderme:\n1. Sorunun yaşandığı sayfada kalın\n2. F12 tuşuna basarak geliştirici araçlarını açın\n3. Console sekmesindeki hataları kopyalayın\n4. Destek ekibine e-posta gönderin\n5. Ekran görüntüsü ekleyin',
          popular: false,
          related: ['tech-4', 'tech-5']
        }
      ]
    }
  ];

  // Filtrelenmiş ve aranan sorular
  const filteredFAQs = useMemo(() => {
    let filtered = faqData;
    
    // Kategori filtreleme
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(category => category.id === selectedCategory);
    }
    
    // Arama filtreleme
    if (searchTerm) {
      filtered = filtered.map(category => ({
        ...category,
        questions: category.questions.filter(q => 
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0);
    }
    
    return filtered;
  }, [searchTerm, selectedCategory, faqData]);

  // Popüler sorular
  const popularQuestions = useMemo(() => {
    const allQuestions = faqData.flatMap(category => category.questions);
    return allQuestions.filter(q => q.popular).slice(0, 5);
  }, [faqData]);

  // İlgili soruları bul
  const getRelatedQuestions = (questionId) => {
    const allQuestions = faqData.flatMap(category => category.questions);
    const currentQuestion = allQuestions.find(q => q.id === questionId);
    if (!currentQuestion || !currentQuestion.related) return [];
    
    return currentQuestion.related
      .map(relatedId => allQuestions.find(q => q.id === relatedId))
      .filter(Boolean);
  };

  // Soru aç/kapat
  const toggleQuestion = (questionId) => {
    setExpandedItems(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Yardımcı olma oylaması
  const handleHelpfulVote = (questionId, isHelpful) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [questionId]: isHelpful
    }));
  };

  // Kategori filtreleme
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setExpandedItems({});
  };

  // Yeni soru gönderme
  const handleNewQuestionSubmit = (e) => {
    e.preventDefault();
    // API çağrısı yapılacak
    console.log('Yeni soru:', newQuestion);
    setShowNewQuestionModal(false);
    setNewQuestion({ category: '', question: '', email: '' });
  };

  // Yardım isteği gönderme
  const handleHelpRequestSubmit = (e) => {
    e.preventDefault();
    // API çağrısı yapılacak
    console.log('Yardım isteği:', helpRequest);
    setShowHelpRequestModal(false);
    setHelpRequest({ name: '', email: '', issue: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" data-ers="faq.page">
      <div className="max-w-6xl mx-auto">
        {/* Başlık */}
        <div className="text-center mb-10" data-ers="faq.header">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Sıkça Sorulan Sorular</h1>
          <p className="text-lg text-gray-600">Jun-Oro hakkında merak ettiğiniz her şey</p>
        </div>

        {/* Arama ve Filtreleme */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8" data-ers="faq.search">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Sorularda ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-ers="faq.search.input"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-ers="faq.category.filter"
              >
                <option value="all">Tüm Kategoriler</option>
                {faqData.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Popüler Sorular */}
        {searchTerm === '' && selectedCategory === 'all' && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8" data-ers="faq.popular">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              Popüler Sorular
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularQuestions.map(question => (
                <div
                  key={question.id}
                  onClick={() => toggleQuestion(question.id)}
                  className="bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  data-ers={`faq.popular.${question.id}`}
                >
                  <h3 className="font-medium text-gray-800 mb-2">{question.question}</h3>
                  <p className="text-sm text-gray-600">Detayları görüntülemek için tıklayın...</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kategoriler ve Sorular */}
        <div className="space-y-8" data-ers="faq.categories">
          {filteredFAQs.map(category => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden" data-ers={`faq.category.${category.id}`}>
              <div className={`p-6 ${category.color} flex items-center gap-3`} data-ers={`faq.category.${category.id}.header`}>
                <category.icon className="text-2xl" />
                <h2 className="text-2xl font-semibold">{category.name}</h2>
              </div>
              
              <div className="p-6 space-y-4" data-ers={`faq.category.${category.id}.questions`}>
                {category.questions.map(question => {
                  const isExpanded = expandedItems[question.id];
                  const relatedQuestions = getRelatedQuestions(question.id);
                  const hasVoted = helpfulVotes[question.id] !== undefined;
                  
                  return (
                    <div key={question.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0" data-ers={`faq.question.${question.id}`}>
                      <div
                        onClick={() => toggleQuestion(question.id)}
                        className="flex items-start justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                        data-ers={`faq.question.${question.id}.header`}
                      >
                        <h3 className="text-lg font-medium text-gray-800 pr-4">{question.question}</h3>
                        <div className="flex items-center gap-2">
                          {question.popular && <FaStar className="text-yellow-500" />}
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-4 pl-3" data-ers={`faq.question.${question.id}.content`}>
                          <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                            {question.answer}
                          </div>
                          
                          {/* İlgili Sorular */}
                          {relatedQuestions.length > 0 && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg" data-ers={`faq.question.${question.id}.related`}>
                              <h4 className="font-medium text-blue-900 mb-2">İlgili Sorular:</h4>
                              <div className="space-y-2">
                                {relatedQuestions.map(related => (
                                  <button
                                    key={related.id}
                                    onClick={() => toggleQuestion(related.id)}
                                    className="block text-left text-blue-700 hover:text-blue-900 underline"
                                    data-ers={`faq.question.${question.id}.related.${related.id}`}
                                  >
                                    {related.question}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Yardımcı Olma Geri Bildirimi */}
                          <div className="mt-4 flex items-center justify-between" data-ers={`faq.question.${question.id}.feedback`}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Bu cevap yardımcı oldu mu?</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleHelpfulVote(question.id, true)}
                                  disabled={hasVoted}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                                    helpfulVotes[question.id] === true
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                                  } ${hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  data-ers={`faq.question.${question.id}.feedback.yes`}
                                >
                                  <FaThumbsUp />
                                  Evet
                                </button>
                                <button
                                  onClick={() => handleHelpfulVote(question.id, false)}
                                  disabled={hasVoted}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                                    helpfulVotes[question.id] === false
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                                  } ${hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  data-ers={`faq.question.${question.id}.feedback.no`}
                                >
                                  <FaThumbsDown />
                                  Hayır
                                </button>
                              </div>
                            </div>
                            {hasVoted && (
                              <span className="text-sm text-green-600">Geri bildiriminiz için teşekkürler!</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Son Güncelleme Tarihi */}
        <div className="mt-8 text-center text-sm text-gray-500" data-ers="faq.footer">
          <p>Son güncelleme: {lastUpdateDate}</p>
        </div>

        {/* Yeni Soru Ekle Butonu */}
        <button
          onClick={() => setShowNewQuestionModal(true)}
          className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
          data-ers="faq.newQuestion.button"
        >
          <FaPlus className="text-xl" />
        </button>

        {/* Yeni Soru Modal */}
        {showNewQuestionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-ers="faq.newQuestion.modal">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Yeni Soru Ekle</h3>
                <button
                  onClick={() => setShowNewQuestionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleNewQuestionSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Kategori seçin</option>
                    {faqData.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sorunuz</label>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-posta (isteğe bağlı)</label>
                  <input
                    type="email"
                    value={newQuestion.email}
                    onChange={(e) => setNewQuestion({...newQuestion, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Yardım İsteği Modal */}
        {showHelpRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-ers="faq.helpRequest.modal">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Yardım İsteği</h3>
                <button
                  onClick={() => setShowHelpRequestModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleHelpRequestSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adınız</label>
                  <input
                    type="text"
                    value={helpRequest.name}
                    onChange={(e) => setHelpRequest({...helpRequest, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                  <input
                    type="email"
                    value={helpRequest.email}
                    onChange={(e) => setHelpRequest({...helpRequest, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
                  <input
                    type="text"
                    value={helpRequest.issue}
                    onChange={(e) => setHelpRequest({...helpRequest, issue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                  <textarea
                    value={helpRequest.description}
                    onChange={(e) => setHelpRequest({...helpRequest, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Yardım İsteği Butonu */}
        <button
          onClick={() => setShowHelpRequestModal(true)}
          className="fixed bottom-8 left-8 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-colors"
          data-ers="faq.helpRequest.button"
        >
          <FaQuestionCircle className="text-xl" />
        </button>
      </div>
    </div>
  );
}

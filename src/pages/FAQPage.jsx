import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeaderComponent } from '../hooks/useHeaderComponent'
import SiteFooter from '../components/SiteFooter'
import ElementSelector from '../components/Tutorial/ElementSelector'
import { FaChevronDown, FaChevronUp, FaGamepad, FaFilm, FaUsers, FaTv, FaBook, FaMusic, FaUtensils, FaDumbbell, FaMoneyBill, FaSeedling, FaLock, FaTasks } from 'react-icons/fa'

function FAQPage() {
  const navigate = useNavigate()
  const HeaderComponent = useHeaderComponent()
  const [openCategory, setOpenCategory] = useState(null)
  const [openQuestion, setOpenQuestion] = useState(null)

  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId)
    setOpenQuestion(null) // Kategori değiştiğinde açık soruyu kapat
  }

  const toggleQuestion = (questionId) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId)
  }

  const faqData = [
    {
      id: 'genel',
      title: 'Genel Sorular',
      icon: <FaUsers className="text-blue-400" />,
      questions: [
        {
          id: 'nedir',
          question: 'Jun-Oro nedir?',
          answer: 'Jun-Oro, oyun, film, dizi, kitap, müzik ve daha birçok alanda kişisel deneyimlerinizi takip edebileceğiniz kapsamlı bir platform koleksiyonudur. 12 farklı uygulama ile dijital yaşamınızı organize edebilirsiniz.'
        },
        {
          id: 'ucretsiz',
          question: 'Platform ücretsiz mi?',
          answer: 'Evet, Jun-Oro tamamen ücretsizdir. Tüm uygulamalara ve özelliklerine herhangi bir ücret ödemeden erişebilirsiniz.'
        },
        {
          id: 'hesap',
          question: 'Hesap oluşturmam gerekiyor mu?',
          answer: 'Hayır, Jun-Oro\'yu kullanmak için hesap oluşturmanız gerekmez. Tüm verileriniz tarayıcınızda yerel olarak saklanır.'
        },
        {
          id: 'veri-guvenlik',
          question: 'Verilerim güvende mi?',
          answer: 'Evet, tüm verileriniz tarayıcınızın yerel depolama alanında saklanır. Hiçbir veri sunucularımıza gönderilmez veya üçüncü taraflarla paylaşılmaz.'
        },
        {
          id: 'nasil-kayit',
          question: 'Nasıl kayıt olabilirim?',
          answer: 'Ana sayfadaki \'Kayıt Ol\' butonuna tıklayarak e-posta adresiniz ve şifrenizle hesap oluşturabilirsiniz. Kayıt işlemi tamamen ücretsizdir.'
        },
        {
          id: 'hesap-silme',
          question: 'Hesabımı nasıl silebilirim?',
          answer: 'Ayarlar sayfasından \'Hesap Yönetimi\' bölümüne giderek hesabınızı kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz.'
        },
        {
          id: 'sifre-unutma',
          question: 'Şifremi unuttum, ne yapmalıyım?',
          answer: 'Giriş sayfasındaki \'Şifremi Unuttum\' linkine tıklayarak e-posta adresinize şifre sıfırlama bağlantısı gönderebilirsiniz.'
        },
        {
          id: 'cihaz-uyumluluk',
          question: 'Hangi cihazlarda çalışır?',
          answer: 'Jun-Oro web tabanlı olduğu için tüm modern tarayıcılarda (Chrome, Firefox, Safari, Edge) ve mobil cihazlarda sorunsuz çalışır.'
        },
        {
          id: 'veri-yedekleme',
          question: 'Verilerimi nasıl yedekleyebilirim?',
          answer: 'Ayarlar sayfasından verilerinizi JSON formatında dışa aktarabilir ve başka bir cihaza aktarabilirsiniz.'
        }
      ]
    },
    {
      id: 'arkade',
      title: 'Arkade - Oyun Takibi',
      icon: <FaGamepad className="text-green-400" />,
      questions: [
        {
          id: 'oyun-ekleme',
          question: 'Oyun nasıl eklerim?',
          answer: 'Arkade kütüphanesine giderek \'Oyun Ekle\' butonuna tıklayın. Oyun adı, platform, tür ve diğer bilgileri doldurarak kütüphanenize ekleyebilirsiniz.'
        },
        {
          id: 'steam-sync',
          question: 'Steam kütüphanem nasıl senkronize edilir?',
          answer: 'Ayarlar sayfasından Steam ID\'nizi girerek kütüphanenizi otomatik olarak senkronize edebilirsiniz. Bu işlem Steam\'in genel profil ayarlarının açık olmasını gerektirir.'
        },
        {
          id: 'oturum-takip',
          question: 'Oyun oturumlarım nasıl takip edilir?',
          answer: 'Oynadığınız süreyi, deneyiminizi ve ilerlemelerinizi kaydetmenizi sağlayan özellik. Her oyun seansınızı detaylı olarak takip edebilirsiniz.'
        },
        {
          id: 'istatistik',
          question: 'Hangi istatistikleri görebilirim?',
          answer: 'Toplam oyun süresi, tamamlanan oyunlar, aylık aktivite, en çok oynanan oyunlar ve daha birçok detaylı istatistiği görebilirsiniz.'
        },
        {
          id: 'oyun-puanlama',
          question: 'Oyun puanlama sistemi nasıl çalışır?',
          answer: 'Oyunları 1-10 arasında puanlayabilirsiniz. Bu puanlar istatistiklerinizde görüntülenir ve favori oyunlarınızı belirlemenize yardımcı olur.'
        },
        {
          id: 'backlog',
          question: 'Backlog nedir?',
          answer: 'Oynamayı planladığınız ancak henüz başlamadığınız oyunların listesidir. Oyunları backlog\'a ekleyerek organize kalabilirsiniz.'
        },
        {
          id: 'wishlist',
          question: 'Wishlist nasıl kullanılır?',
          answer: 'Satın almayı düşündüğünüz oyunları wishlist\'e ekleyebilirsiniz. Fiyat takibi ve hatırlatma özelliklerini kullanabilirsiniz.'
        },
        {
          id: 'oyun-galeri',
          question: 'Oyun galeri özelliği nedir?',
          answer: 'Oyunlarınızın ekran görüntülerini, videolarını ve özel anlarınızı saklayabileceğiniz bir galeri sistemidir.'
        }
      ]
    },
    {
      id: 'sinepedi',
      title: 'Sinepedi - Film Takibi',
      icon: <FaFilm className="text-red-400" />,
      questions: [
        {
          id: 'film-arama',
          question: 'Film/dizi nasıl eklerim?',
          answer: 'Sinepedi bölümünde arama yaparak veya manuel olarak film/dizi ekleyebilirsiniz. TMDB veritabanından otomatik bilgi çekimi yapılır.'
        },
        {
          id: 'izleme-listesi',
          question: 'İzleme listesi nasıl oluşturulur?',
          answer: 'Farklı kategorilerde (izlenecek, izleniyor, izlendi) listeler oluşturabilir ve film/dizilerinizi organize edebilirsiniz.'
        },
        {
          id: 'puan-verme',
          question: 'Puanlama sistemi nasıl çalışır?',
          answer: 'İzlediğiniz film/dizileri 1-10 arasında puanlayabilir ve kişisel notlar ekleyebilirsiniz.'
        }
      ]
    },
    {
      id: 'zombososyal',
      title: 'Zombososyal - Sosyal Platform',
      icon: <FaUsers className="text-purple-400" />,
      questions: [
        {
          id: 'sosyal-ozellik',
          question: 'Zombososyal nedir?',
          answer: 'Sosyal medya kullanımınızı takip ederek dijital detoks yapmanıza yardımcı olan uygulama. Ekran süresi ve uygulama kullanımını izler.'
        },
        {
          id: 'gizlilik',
          question: 'Dijital detoks nasıl çalışır?',
          answer: 'Günlük sosyal medya kullanım limitleri belirleyebilir ve hedeflerinize ulaşma durumunuzu takip edebilirsiniz.'
        }
      ]
    },
    {
      id: 'bolum-bolum',
      title: 'Bölüm Bölüm - Dizi Takibi',
      icon: <FaTv className="text-yellow-400" />,
      questions: [
        {
          id: 'dizi-takip',
          question: 'Dizi takibi nasıl yapılır?',
          answer: 'İzlediğiniz dizileri ve bölümleri takip edebilir, hangi bölümde kaldığınızı görebilir ve yeni bölüm bildirimlerini alabilirsiniz.'
        },
        {
          id: 'yeni-bolum',
          question: 'Sezon ve bölüm ilerlemesi nasıl kaydedilir?',
          answer: 'Her izlediğiniz bölümü işaretleyerek otomatik olarak ilerleme kaydedilir. Hangi sezonda hangi bölümde olduğunuzu kolayca görebilirsiniz.'
        }
      ]
    },
    {
      id: 'sayfa',
      title: 'Sayfa - Kitap Takibi',
      icon: <FaBook className="text-orange-400" />,
      questions: [
        {
          id: 'kitap-ekleme',
          question: 'Kitap okuma takibi nasıl yapılır?',
          answer: 'Okuduğunuz kitapları, sayfa ilerlemesini ve okuma hızınızı takip edebilirsiniz. Günlük okuma hedefleri belirleyebilirsiniz.'
        },
        {
          id: 'okuma-hedef',
          question: 'Okuma istatistikleri neler gösterir?',
          answer: 'Aylık okunan sayfa sayısı, kitap sayısı, okuma hızı, favori türler ve okuma alışkanlıklarınızı gösteren detaylı istatistikler.'
        }
      ]
    },
    {
      id: 'melodi',
      title: 'Melodi - Müzik Takibi',
      icon: <FaMusic className="text-pink-400" />,
      questions: [
        {
          id: 'muzik-takip',
          question: 'Müzik takibi nasıl çalışır?',
          answer: 'Dinlediğiniz müzikleri, sanatçıları ve çalma listelerinizi takip edebilir, müzik zevkinizi analiz edebilirsiniz.'
        },
        {
          id: 'playlist',
          question: 'Spotify entegrasyonu var mı?',
          answer: 'Evet, Spotify hesabınızı bağlayarak dinleme geçmişinizi otomatik olarak senkronize edebilirsiniz.'
        }
      ]
    },
    {
      id: 'besinepedi',
      title: 'Besinepedi - Yemek Takibi',
      icon: <FaUtensils className="text-green-500" />,
      questions: [
        {
          id: 'tarif-ekleme',
          question: 'Beslenme takibi nasıl yapılır?',
          answer: 'Günlük kalori, makro besin değerleri (protein, karbonhidrat, yağ) ve mikro besinleri takip edebilirsiniz. Geniş besin veritabanı mevcuttur.'
        },
        {
          id: 'beslenme-takip',
          question: 'Kalori hedefi nasıl belirlenir?',
          answer: 'Yaş, cinsiyet, boy, kilo ve aktivite seviyenize göre otomatik kalori hedefi hesaplanır. Manuel olarak da düzenleyebilirsiniz.'
        },
        {
          id: 'besin-degerleri',
          question: 'Besin değerleri nasıl hesaplanır?',
          answer: 'Kapsamlı besin veritabanından otomatik hesaplama yapılır. Barkod okuyarak da besin ekleyebilirsiniz.'
        }
      ]
    },
    {
      id: 'kas-kurdu',
      title: 'Kas Kurdu - Fitness Takibi',
      icon: <FaDumbbell className="text-red-500" />,
      questions: [
        {
          id: 'antrenman-program',
          question: 'Antrenman programı nasıl oluşturulur?',
          answer: 'Hedeflerinize göre kişiselleştirilmiş antrenman programları oluşturabilir, egzersiz kütüphanesinden seçim yapabilirsiniz.'
        },
        {
          id: 'ilerleme-takip',
          question: 'İlerleme takibi nasıl yapılır?',
          answer: 'Ağırlık, tekrar sayısı, set sayısı ve vücut ölçülerinizi kaydederek ilerlemenizi grafik halinde görebilirsiniz.'
        },
        {
          id: 'egzersiz-video',
          question: 'Egzersiz videoları var mı?',
          answer: 'Evet, her egzersiz için doğru form ve teknik gösteren video rehberleri mevcuttur.'
        }
      ]
    },
    {
      id: 'finans-lab',
      title: 'FinansLab - Finans Yönetimi',
      icon: <FaMoneyBill className="text-green-600" />,
      questions: [
        {
          id: 'butce-planlama',
          question: 'Gelir-gider takibi nasıl yapılır?',
          answer: 'Aylık bütçenizi oluşturabilir, gelir ve giderlerinizi kategorilere ayırarak detaylı finansal analiz yapabilirsiniz.'
        },
        {
          id: 'harcama-analiz',
          question: 'Bütçe uyarıları nasıl çalışır?',
          answer: 'Belirlediğiniz bütçe limitlerini aştığınızda otomatik uyarılar alırsınız. Harcama kategorileri için ayrı limitler belirleyebilirsiniz.'
        },
        {
          id: 'finansal-raporlar',
          question: 'Finansal raporlar neler içerir?',
          answer: 'Aylık/yıllık gelir-gider analizi, kategori bazında harcama dağılımı, tasarruf oranı ve finansal hedef takibi raporları.'
        }
      ]
    },
    {
      id: 'rutin',
      title: 'Rutin - Alışkanlık Takibi',
      icon: <FaSeedling className="text-green-300" />,
      questions: [
        {
          id: 'aliskanlik-olusturma',
          question: 'Günlük rutin nasıl oluşturulur?',
          answer: 'Alışkanlıklarınızı ve günlük rutinlerinizi belirleyebilir, hatırlatmalar kurabilir ve ilerlemenizi takip edebilirsiniz.'
        },
        {
          id: 'motivasyon',
          question: 'Alışkanlık takibi nasıl çalışır?',
          answer: 'Her alışkanlık için günlük tamamlama durumunu işaretleyerek streak (ardışık gün) sayınızı artırabilirsiniz.'
        },
        {
          id: 'hatirlatmalar',
          question: 'Hatırlatmalar nasıl ayarlanır?',
          answer: 'Her rutin için özel saatler belirleyebilir ve push notification ile hatırlatma alabilirsiniz.'
        }
      ]
    },
    {
      id: 'titan',
      title: 'Titan - Dosya Yönetimi',
      icon: <FaLock className="text-blue-600" />,
      questions: [
        {
          id: 'yedekleme',
          question: 'Hedef belirleme nasıl çalışır?',
          answer: 'SMART hedefler (Spesifik, Ölçülebilir, Ulaşılabilir, Gerçekçi, Zamanlı) oluşturabilir ve ilerlemenizi takip edebilirsiniz.'
        },
        {
          id: 'senkronizasyon',
          question: 'Hedef kategorileri nelerdir?',
          answer: 'Kişisel, profesyonel, sağlık, finansal, eğitim ve sosyal kategorilerde hedefler belirleyebilirsiniz.'
        },
        {
          id: 'ilerleme-olcum',
          question: 'İlerleme nasıl ölçülür?',
          answer: 'Her hedef için alt görevler oluşturabilir, yüzdelik ilerleme takibi yapabilir ve milestone\'ları belirleyebilirsiniz.'
        }
      ]
    },
    {
      id: 'yapyap',
      title: 'Yapyap - Görev Yönetimi',
      icon: <FaTasks className="text-indigo-400" />,
      questions: [
        {
          id: 'gorev-olusturma',
          question: 'Görev yönetimi nasıl çalışır?',
          answer: 'Günlük görevlerinizi, projelerinizi ve to-do listelerinizi organize edebilir, öncelik sıralaması yapabilirsiniz.'
        },
        {
          id: 'proje-yonetimi',
          question: 'Proje yönetimi özellikleri nelerdir?',
          answer: 'Büyük projeleri alt görevlere bölebilir, deadline belirleyebilir ve ekip üyeleriyle paylaşabilirsiniz.'
        },
        {
          id: 'gorev-kategorileri',
          question: 'Görev kategorileri nasıl oluşturulur?',
          answer: 'İş, kişisel, acil, önemli gibi kategoriler oluşturarak görevlerinizi organize edebilir ve filtreleme yapabilirsiniz.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" id="faq-page" data-registry="1.0">
      <HeaderComponent />
      <ElementSelector />
      
      <div className="container mx-auto px-4 py-8">
        {/* Başlık */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Sık Sorulan Sorular
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Jun-Oro platformu ve uygulamaları hakkında merak ettiğiniz her şey
          </p>
        </div>

        {/* FAQ Kategorileri */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqData.map((category) => (
            <div key={category.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
              {/* Kategori Başlığı */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {category.title}
                  </h2>
                </div>
                <div className="text-gray-400">
                  {openCategory === category.id ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </button>

              {/* Kategori Soruları */}
              {openCategory === category.id && (
                <div className="px-6 pb-6 space-y-3">
                  {category.questions.map((qa) => (
                    <div key={qa.id} className="bg-slate-700/30 rounded-lg">
                      <button
                        onClick={() => toggleQuestion(qa.id)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-600/30 transition-colors rounded-lg"
                      >
                        <h3 className="text-white font-medium">
                          {qa.question}
                        </h3>
                        <div className="text-gray-400 text-sm">
                          {openQuestion === qa.id ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </button>
                      
                      {openQuestion === qa.id && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-300 leading-relaxed">
                            {qa.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* İletişim Bölümü */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Sorunuz burada yok mu?
            </h3>
            <p className="text-gray-300 mb-6">
              Aradığınız cevabı bulamadıysanız bizimle iletişime geçin
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/contact')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                İletişime Geç
              </button>
              <button
                onClick={() => navigate('/feedback')}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Geri Bildirim Gönder
              </button>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

export default FAQPage
# ERS (Element Registry System) Registry

Bu dosya Jun-Oro projesindeki tüm UI element'lerini ve ERS kodlarını içerir.

## Format

`PAGE.SECTION.CONTAINER.ELEMENT`

- **PAGE**: Sayfa numarası (1-999)
- **SECTION**: Sayfa içindeki bölüm (1-99)
- **CONTAINER**: Bölüm içindeki konteyner (1-99)
- **ELEMENT**: Konteyner içindeki element (1-999)

## AddGameModal Component'leri

### Ana Modal

- `add-game-modal.overlay` - Modal arka plan overlay'i
- `add-game-modal.container` - Modal ana konteyner'i
- `add-game-modal.content` - Modal içeriği
- `add-game-modal.header` - Modal başlık alanı
- `add-game-modal.title` - Modal başlığı
- `add-game-modal.close-button` - Modal kapatma butonu
- `add-game-modal.body` - Modal gövde alanı

### Arama Bölümü

- `add-game-modal.search` - Oyun arama bölümü
- `add-game-modal.search-input` - Arama input alanı
- `add-game-modal.search-button` - Arama butonu
- `add-game-modal.search-error` - Arama hata mesajı
- `add-game-modal.search-results` - Arama sonuçları konteyner'i
- `add-game-modal.search-result.{n}` - Arama sonucu kartı (n: 1-20)
- `add-game-modal.search-result-card.{n}` - Arama sonucu kart detayı
- `add-game-modal.edit-button.{n}` - Oyun düzenleme butonu

### Oyun Detayları

- `add-game-modal.game-details` - Oyun detayları bölümü
- `add-game-modal.back-button` - Geri dön butonu
- `add-game-modal.game-cover` - Oyun kapak görseli
- `add-game-modal.quick-stats` - Hızlı istatistikler kutusu
- `add-game-modal.genres` - Oyun türleri bölümü
- `add-game-modal.genre.{id}` - Oyun türü etiketi
- `add-game-modal.game-info` - Oyun bilgileri bölümü
- `add-game-modal.genre-detail.{id}` - Detay sayfadaki oyun türü

### DLC Seçimi

- `add-game-modal.dlc-selection` - DLC seçimi bölümü
- `add-game-modal.refresh-dlc` - DLC verilerini yenile butonu
- `add-game-modal.select-all-dlc` - Tüm DLC'leri seç butonu
- `add-game-modal.clear-all-dlc` - Tüm DLC'leri temizle butonu
- `add-game-modal.dlc-item.{id}` - DLC item kartı
- `add-game-modal.selected-dlcs-summary` - Seçilen DLC'ler özeti

### Oyun Formu

- `add-game-modal.game-form` - Oyun ekleme formu
- `add-game-modal.platform-selection` - Platform seçimi bölümü
- `add-game-modal.platform.{name}` - Platform seçenek butonu (name: steam, epic-games, playstation, xbox)
- `add-game-modal.other-platforms` - Diğer platformlar dropdown'ı
- `add-game-modal.playtime-input` - Oynama süresi input bölümü
- `add-game-modal.playtime` - Oynama süresi input alanı
- `add-game-modal.status-selection` - Durum seçimi bölümü
- `add-game-modal.status` - Durum dropdown'ı
- `add-game-modal.campaign-management` - Campaign yönetimi bölümü
- `add-game-modal.campaign-button` - Campaign yönetimi butonu
- `add-game-modal.hltb-button` - HLTB ekle butonu
- `add-game-modal.form-error` - Form hata mesajı
- `add-game-modal.submit-button` - Oyun ekleme butonu

### Campaign Yönetimi

- `add-game-modal.campaign-management` - Campaign yönetimi ana bölümü
- `add-game-modal.campaign-header` - Campaign başlık ve özet
- `add-game-modal.campaign-tools` - Campaign araçları bölümü
- `add-game-modal.import-button` - TXT import butonu
- `add-game-modal.ai-prompt-button` - AI prompt butonu
- `add-game-modal.new-campaign-button` - Yeni campaign butonu
- `add-game-modal.import-textarea` - Import metin alanı
- `add-game-modal.import-submit-button` - Import onay butonu
- `add-game-modal.import-cancel-button` - Import iptal butonu
- `add-game-modal.ai-prompt-textarea` - AI prompt metin alanı
- `add-game-modal.copy-prompt-button` - Prompt kopyala butonu
- `add-game-modal.close-prompt-button` - Prompt kapat butonu
- `add-game-modal.campaign-form` - Campaign form bölümü
- `add-game-modal.campaign-name` - Campaign adı input'u
- `add-game-modal.parent-campaign` - Ana campaign seçimi
- `add-game-modal.campaign-duration` - Campaign süresi input'u
- `add-game-modal.campaign-description` - Campaign açıklaması
- `add-game-modal.add-property-button` - Özellik ekle butonu
- `add-game-modal.save-campaign-button` - Campaign kaydet butonu
- `add-game-modal.campaign-list` - Campaign listesi bölümü
- `add-game-modal.expand-campaign-{id}` - Campaign genişlet butonu
- `add-game-modal.campaign-name-{id}` - Campaign adı
- `add-game-modal.add-sub-campaign-{id}` - Alt campaign ekle butonu
- `add-game-modal.edit-campaign-{id}` - Campaign düzenle butonu
- `add-game-modal.delete-campaign-{id}` - Campaign sil butonu
- `add-game-modal.sub-campaign-name-{id}` - Alt campaign adı
- `add-game-modal.edit-sub-campaign-{id}` - Alt campaign düzenle butonu
- `add-game-modal.delete-sub-campaign-{id}` - Alt campaign sil butonu

### Gezinme ve Düzenleme

- `add-game-modal.back-to-game` - Oyun moduna geri dön
- `add-game-modal.game-details-section` - Oyun detayları bölümü
- `add-game-modal.back-to-search` - Aramaya geri dön
- `add-game-modal.game-content` - Oyun içeriği grid'i
- `add-game-modal.form-section` - Form bölümü
- `add-game-modal.dlc-section` - DLC bölümü

## Component Dosya Yolları

### Ana Modal

- `src/components/AddGameModal.jsx` - Ana modal component'i

### Alt Component'ler

- `src/components/AddGameModal/utils.js` - Utility fonksiyonları
- `src/components/AddGameModal/GameSearch.jsx` - Oyun arama component'i
- `src/components/AddGameModal/GameDetails.jsx` - Oyun detayları component'i
- `src/components/AddGameModal/DLCSelection.jsx` - DLC seçimi component'i
- `src/components/AddGameModal/GameForm.jsx` - Oyun formu component'i
- `src/components/AddGameModal/CampaignManagement.jsx` - Campaign yönetimi component'i
- `src/components/AddGameModal/CampaignHeader.jsx` - Campaign başlık component'i
- `src/components/AddGameModal/CampaignTools.jsx` - Campaign araçları component'i
- `src/components/AddGameModal/CampaignForm.jsx` - Campaign formu component'i
- `src/components/AddGameModal/CampaignList.jsx` - Campaign listesi component'i

## Kullanım Notları

1. **Dinamik Elementler**: `{n}` veya `{id}` ile belirtilen elementler dinamik olarak oluşturulur
2. **Index Bazlı**: Arama sonuçları gibi listeler için index bazlı naming kullanılır
3. **ID Bazlı**: Campaign'ler gibi benzersiz ID'ler olan elementler için ID bazlı naming kullanılır
4. **Hiyerarşi**: Parent-child ilişkisi korunur, alt elementler parent kodunu içerir
5. **Component Yapısı**: Her component kendi dosyasında yer alır ve ilgili ERS kodlarını içerir

## FAQPage Component'leri

### Ana Sayfa

- `faq-page.container` - SSS sayfası ana konteyner'i
- `faq-page.header` - Sayfa başlık alanı
- `faq-page.title` - Sayfa başlığı
- `faq-page.subtitle` - Sayfa alt başlığı
- `faq-page.last-update` - Son güncelleme tarihi

### Arama ve Filtreleme

- `faq-page.search-section` - Arama bölümü
- `faq-page.search-input` - Arama input alanı
- `faq-page.search-icon` - Arama ikonu
- `faq-page.category-filters` - Kategori filtreleri bölümü
- `faq-page.category-filter.{id}` - Kategori filtre butonu
- `faq-page.clear-filters` - Filtreleri temizle butonu

### Popüler Sorular

- `faq-page.popular-section` - Popüler sorular bölümü
- `faq-page.popular-title` - Popüler sorular başlığı
- `faq-page.popular-grid` - Popüler sorular grid'i
- `faq-page.popular-item.{id}` - Popüler soru kartı

### Kategoriler ve Sorular

- `faq-page.categories-section` - Kategoriler bölümü
- `faq-page.category.{id}` - Kategori konteyner'i
- `faq-page.category-header.{id}` - Kategori başlığı
- `faq-page.category-icon.{id}` - Kategori ikonu
- `faq-page.category-title.{id}` - Kategori başlığı
- `faq-page.category-description.{id}` - Kategori açıklaması
- `faq-page.questions-grid.{id}` - Sorular grid'i
- `faq-page.question-item.{id}.{qid}` - Soru kartı
- `faq-page.question-header.{id}.{qid}` - Soru başlık alanı
- `faq-page.question-title.{id}.{qid}` - Soru başlığı
- `faq-page.question-toggle.{id}.{qid}` - Soru aç/kapa butonu
- `faq-page.question-content.{id}.{qid}` - Soru cevap içeriği
- `faq-page.question-answer.{id}.{qid}` - Cevap metni
- `faq-page.question-feedback.{id}.{qid}` - Geri bildirim bölümü
- `faq-page.helpful-yes.{id}.{qid}` - "Evet, yardımcı oldu" butonu
- `faq-page.helpful-no.{id}.{qid}` - "Hayır, yardımcı olmadı" butonu
- `faq-page.related-questions.{id}.{qid}` - İlgili sorular bölümü
- `faq-page.related-question.{id}.{qid}.{rid}` - İlgili soru linki

### Modal Pencereler

- `faq-page.new-question-modal` - Yeni soru ekleme modal'ı
- `faq-page.new-question-overlay` - Modal arka plan overlay'i
- `faq-page.new-question-container` - Modal ana konteyner'i
- `faq-page.new-question-header` - Modal başlık alanı
- `faq-page.new-question-title` - Modal başlığı
- `faq-page.new-question-close` - Modal kapatma butonu
- `faq-page.new-question-form` - Yeni soru formu
- `faq-page.question-category` - Kategori seçimi
- `faq-page.question-email` - E-posta input'u
- `faq-page.question-text` - Soru metni textarea'sı
- `faq-page.submit-question` - Soru gönderme butonu
- `faq-page.cancel-question` - İptal butonu

- `faq-page.help-modal` - Yardım isteği modal'ı
- `faq-page.help-overlay` - Modal arka plan overlay'i
- `faq-page.help-container` - Modal ana konteyner'i
- `faq-page.help-header` - Modal başlık alanı
- `faq-page.help-title` - Modal başlığı
- `faq-page.help-close` - Modal kapatma butonu
- `faq-page.help-form` - Yardım formu
- `faq-page.help-type` - Yardım türü seçimi
- `faq-page.help-description` - Sorun açıklaması textarea'sı
- `faq-page.submit-help` - Yardım isteği gönderme butonu
- `faq-page.cancel-help` - İptal butonu

### Bildirimler

- `faq-page.notification` - Bildirim kutusu
- `faq-page.notification-success` - Başarılı bildirim
- `faq-page-notification-error` - Hata bildirimi
- `faq-page.notification-close` - Bildirim kapatma butonu

### Component Dosya Yolu

- `src/pages/FAQPage.jsx` - SSS sayfası component'i

## Kategori ID'leri

- `getting-started` - 🚀 Başlangıç ve Kurulum
- `library` - 📚 Kütüphane Yönetimi
- `sessions` - 🎮 Oyun ve Oturumlar
- `stats` - 📊 İstatistikler ve Raporlar
- `settings` - ⚙️ Ayarlar ve Tercihler
- `integrations` - 🌐 Entegrasyonlar
- `security` - 🔒 Güvenlik ve Gizlilik
- `technical` - 🔧 Teknik Sorunlar

## Güncelleme Tarihi

- 10.11.2025: AddGameModal component'leri ERS ile entegre edildi
- 10.11.2025: Tüm component'lere ERS attribute'leri eklendi ve registry güncellendi
- 11.11.2025: FAQPage component'leri ERS ile entegre edildi

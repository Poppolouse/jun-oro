# Bakım Planı: Kod Temizliği (Code Cleanup)

**Ana Hedef:** Proje genelindeki küçük ve orta ölçekli kod kirliliklerini sistematik olarak temizleyerek kod kalitesini, okunabilirliği ve bakım kolaylığını artırmak.

---

### BÖLÜM 1: OTOMATİK ANALİZ VE DÜZELTME

#### Faz A: Linter Kurallarını Sıkılaştırma
1.  **Görev:** `.eslintrc.cjs` dosyasını aç.
2.  **Ekle/Güncelle:** Aşağıdaki gibi kuralları ekleyerek linter'ı daha hassas hale getir:
    *   `"complexity": ["warn", 10]` (Bir fonksiyonun sahip olabileceği maksimum karmaşıklık).
    *   `"max-lines-per-function": ["warn", 70]` (Fonksiyonlar için ideal 50 satır hedefine yaklaşmak için bir üst sınır).
    *   `"no-magic-numbers": "warn"` (Kod içinde anlamsız sayıların kullanımını engellemek).
    *   `"no-console": "warn"` (Production'a gitmemesi gereken `console.log`'ları tespit etmek).

#### Faz B: Otomatik Düzeltmeleri Uygulama
1.  **Görev:** Projenin kök dizininde `npm run lint -- --fix` komutunu çalıştır.
2.  **Analiz Et:** Komut çıktısını incele. Otomatik olarak düzeltilemeyen hataları ve uyarıları not al. Bu hatalar sonraki fazlarda manuel olarak düzeltilecektir.

---

### BÖLÜM 2: MANUEL DENETİM VE DÜZELTME

#### Faz C: Fonksiyon Boyutu İhlallerini Düzeltme
1.  **Denetle:** Faz A ve B'de linter tarafından raporlanan ve 70 satırı aşan fonksiyonların bir listesini çıkar.
2.  **Düzelt (Tekrarlı Süreç):** Listelenen her bir fonksiyon için:
    *   Fonksiyonu analiz et ve mantıksal olarak daha küçük yardımcı fonksiyonlara bölünüp bölünemeyeceğini değerlendir.
    *   Özellikle `if-else` blokları veya `switch` yapıları içindeki uzun kod parçacıklarını ayrı fonksiyonlara taşı.
    *   Fonksiyonu yeniden yapılandır ve 70 satırın altına düşür.

#### Faz D: Kod Tekrarı (Duplication) Düzeltmeleri
1.  **Denetle:** Proje genelinde (özellikle JSX içinde) tekrar eden kod bloklarını manuel olarak veya `jscpd` gibi bir araç kullanarak tespit et.
    *   Örnek: Farklı sayfalarda kullanılan benzer form yapıları, benzer liste render etme mantıkları.
2.  **Düzelt (Tekrarlı Süreç):** Tespit edilen her bir kod tekrarı için:
    *   Eğer tekrar eden kod bir JSX parçası ise, onu `src/components/shared` altında yeni bir bileşene taşı.
    *   Eğer tekrar eden kod bir iş mantığı ise, onu `src/hooks` altında yeni bir custom hook'a taşı.

#### Faz E: "Sihirli Sayı/String" (Magic Number/String) Düzeltmeleri
1.  **Denetle:** Proje genelinde `src/constants.js` veya `src/config.js` gibi merkezi bir dosyada tanımlanması gereken hard-coded değerleri (API endpoint URL'leri, özel string'ler, sayısal eşik değerleri vb.) tespit et.
2.  **Merkezileştir:** `src/constants.js` adında bir dosya oluştur (eğer yoksa).
3.  **Düzelt (Tekrarlı Süreç):** Tespit edilen her "sihirli" değeri bu `constants.js` dosyasına taşı ve kodu, bu sabitleri import edecek şekilde güncelle.
    *   Örnek: `if (user.role === 'admin')` yerine `if (user.role === USER_ROLES.ADMIN)`.

---

### BÖLÜM 3: SON KONTROLLER

#### Faz F: Nihai Gözden Geçirme
1.  **Görev:** Tüm manuel düzeltmeler bittikten sonra, `npm run lint` ve `npm run build` komutlarını tekrar çalıştırarak yeni hatalar oluşmadığından emin ol.
2.  **Onayla:** Projenin daha temiz, daha modüler ve standartlara daha uygun olduğunu onayla.

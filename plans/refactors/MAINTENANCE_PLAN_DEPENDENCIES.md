# Bakım Planı: Bağımlılık Yönetimi (Dependency Management)

**Ana Hedef:** Projenin tüm bağımlılıklarını (npm paketleri) güvenli ve stabil versiyonlara yükselterek potansiyel güvenlik açıklarını kapatmak, performans iyileştirmelerinden faydalanmak ve projenin güncel kalmasını sağlamak.

**Önemli Not:** Her güncelleme sonrası projenin testlerinin ve build sürecinin sorunsuz çalıştığı mutlaka kontrol edilmelidir. Güncellemeler, `main` branch yerine ayrı bir `chore/update-dependencies` branch'inde yapılmalıdır.

---

### BÖLÜM 1: ANALİZ VE GÜVENLİ GÜNCELLEMELER

#### Faz A: Bağımlılıkları Denetleme
1.  **Kök Dizin:** Projenin kök dizininde `npm outdated` komutunu çalıştır ve sonuçları bir metin dosyasına kaydet.
2.  **Backend Dizini:** `backend/` klasörüne geç ve `npm outdated` komutunu çalıştır. Sonuçları ayrı bir metin dosyasına kaydet.
3.  **Güvenlik Taraması:** Kök dizinde `npm audit` komutunu çalıştır. Raporlanan güvenlik açıklarını (özellikle `high` ve `critical` olanları) ve çözüm önerilerini not al.

#### Faz B: Küçük (Patch) Versiyon Güncellemeleri
1.  **Hedef:** En düşük riskli güncellemeleri tek seferde yapmak. Bunlar genellikle hata düzeltmeleri içerir (örn: 1.2.3 -> 1.2.4).
2.  **Uygulama:**
    *   Kök dizindeki `package.json` dosyasını aç. `npm outdated` çıktısına bakarak sadece "Patch" sütununda değişikliği olan paketleri `^x.y.z` formatında en son versiyonlarına güncelle.
    *   `npm install` komutunu çalıştır.
    *   `npm run test` ve `npm run build` komutlarını çalıştırarak hiçbir şeyin bozulmadığını doğrula.
    *   Aynı işlemi `backend/` klasörü için tekrarla.

---

### BÖLÜM 2: KONTROLLÜ ORTA VE BÜYÜK GÜNCELLEMELER

#### Faz C: İkincil (Minor) Versiyon Güncellemeleri
1.  **Hedef:** Yeni (ancak geriye dönük uyumlu) özellikler ekleyen güncellemeleri kontrollü bir şekilde yapmak (örn: 1.2.4 -> 1.3.0).
2.  **Uygulama (Tekrarlı Süreç):**
    *   `npm outdated` listesinden bir veya birkaç tane birbiriyle ilişkili "Minor" güncelleme seç (örn: `@vitejs/plugin-react` ve `vite`).
    *   `package.json` dosyasında bu paketlerin versiyonlarını manuel olarak güncelle.
    *   `npm install` komutunu çalıştır.
    *   İlgili paketlerin projedeki kullanım alanlarını manuel olarak test et. Örneğin, Vite güncellemesi sonrası `npm run dev` ve `npm run build` komutlarının doğru çalışıp çalışmadığını kontrol et.
    *   Tüm testleri (`npm run test`) çalıştır.
    *   Her bir küçük grup güncellemesi için ayrı bir commit at.

#### Faz D: Ana (Major) Versiyon Güncellemeleri
1.  **Hedef:** En riskli olan, geriye dönük uyumluluğu bozan (breaking changes) güncellemeleri, resmi dokümantasyonları takip ederek dikkatlice yapmak (örn: 1.3.0 -> 2.0.0).
2.  **Faz D1 - React 18'e Geçiş (Örnek):**
    *   React 18'in resmi geçiş rehberini (`migration guide`) oku.
    *   `react` ve `react-dom` paketlerini `18.x.x` versiyonuna güncelle.
    *   `src/main.jsx` dosyasını, `ReactDOM.createRoot` kullanacak şekilde güncelle.
    *   Proje genelinde `useEffect` kullanımlarında veya diğer potansiyel "breaking change" yaratacak kısımlarda gerekli düzenlemeleri yap.
    *   Tüm testleri ve E2E testlerini çalıştırarak uygulamanın baştan sona çalıştığından emin ol.
3.  **Faz D2 - Express 5'e Geçiş (Örnek):**
    *   `backend/` klasöründe Express'i en son ana versiyona güncelle.
    *   Resmi geçiş rehberini oku. Özellikle `error handling` ve `router` yapısındaki değişiklikleri kontrol et.
    *   Backend'deki tüm endpoint'lerin Postman veya benzeri bir araçla hala doğru çalıştığını test et.

---

### BÖLÜM 3: GÜVENLİK

#### Faz E: Güvenlik Açıklarını Kapatma
1.  **Hedef:** `npm audit` tarafından raporlanan `high` ve `critical` seviyedeki güvenlik açıklarını kapatmak.
2.  **Uygulama:**
    *   `npm audit` raporunu tekrar incele.
    *   `npm audit fix` komutunu çalıştırarak otomatik düzeltilebilen açıkları düzelt.
    *   Otomatik düzeltilemeyenler için, raporun önerdiği çözüm adımlarını manuel olarak uygula. Bu genellikle belirli bir paketin versiyonunu manuel olarak yükseltmeyi veya değiştirmeyi içerir.
    *   Her adımdan sonra testleri çalıştırarak uygulamanın bozulmadığından emin ol.

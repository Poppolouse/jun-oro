# Test Kılavuzu

Bu kılavuz, Jun-Oro projesindeki testlerin nasıl çalıştırılacağını, yeni testlerin nasıl yazılacağını ve projenin genel test stratejisini açıklar. Kaliteli ve sürdürülebilir bir kod tabanı için test yazmak kritik öneme sahiptir.

---

### Test Felsefesi

Projemizde, farklı seviyelerde testler yazarak "Test Piramidi" prensibine uymayı hedefliyoruz:

1.  **Birim Testleri (Unit Tests):** En alt katmandır. Tek bir fonksiyonun veya bileşenin (izole edilmiş halde) doğru çalışıp çalışmadığını kontrol eder. Hızlıdırlar ve en çok yazılması gereken test türüdür.
2.  **Entegrasyon Testleri (Integration Tests):** Birden fazla birimin (örneğin, bir React bileşeninin bir API servisiyle) birlikte doğru çalışıp çalışmadığını test eder.
3.  **Uçtan Uca Testler (End-to-End - E2E):** En üst katmandır. Kullanıcının yaptığı gibi, tüm uygulamayı tarayıcıda baştan sona test eder. Yavaştırlar ancak en yüksek güvenceyi sağlarlar.

---

### Frontend Testleri (`/package.json`)

Frontend testleri için **Vitest** (birim ve entegrasyon) ve **Playwright** (E2E) kullanıyoruz.

**Testleri Çalıştırma:**
Tüm testleri çalıştırmak için projenin ana dizininde aşağıdaki komutları kullanabilirsiniz:

*   **Tüm Vitest testlerini çalıştırmak:**
    ```bash
    npm test
    ```
*   **Değişiklikleri izleyerek testleri çalıştırmak:**
    ```bash
    npm run test:watch
    ```
*   **Test kapsamı (coverage) raporu oluşturmak:**
    ```bash
    npm run test:coverage
    ```
*   **Tüm E2E testlerini çalıştırmak (headless):**
    ```bash
    npm run test:e2e
    ```
*   **E2E testlerini tarayıcı arayüzü ile çalıştırmak:**
    ```bash
    npm run test:e2e:ui
    ```

**Yeni Bir Frontend Testi Yazma:**
*   **Birim/Entegrasyon Testi:** Test etmek istediğiniz bileşenin (`.jsx`) veya fonksiyonun (`.js`) yanına `.test.jsx` veya `.test.js` uzantılı bir dosya oluşturun. Örneğin, `Button.jsx` için `Button.test.jsx`.
*   **E2E Testi:** `tests/e2e` klasörü içine yeni bir test dosyası (`.spec.js`) ekleyin. Playwright, kullanıcı etkileşimlerini simüle etmek için güçlü bir API sunar.

---

### Backend Testleri (`/backend/package.json`)

Backend testleri için **Jest** ve API endpoint'lerini test etmek için **Supertest** kullanıyoruz.

**Testleri Çalıştırma:**
Backend testlerini çalıştırmak için `backend` dizinine geçiş yapmanız gerekir:
```bash
cd backend
```

*   **Tüm Jest testlerini çalıştırmak:**
    ```bash
    npm test
    ```
*   **Değişiklikleri izleyerek testleri çalıştırmak:**
    ```bash
    npm run test:watch
    ```
*   **Test kapsamı (coverage) raporu oluşturmak:**
    ```bash
    npm run test:coverage
    ```

**Yeni Bir Backend Testi Yazma:**
*   Backend'de testler `backend/tests` klasörü altında `unit` ve `integration` olarak ikiye ayrılmıştır.
*   **Birim Testi:** Bir servis fonksiyonu gibi tek bir birimi test etmek için `backend/tests/unit` altına yeni bir `.test.js` dosyası ekleyin.
*   **Entegrasyon Testi:** Bir API endpoint'inin baştan sona doğru çalışıp çalışmadığını (request -> response) test etmek için `backend/tests/integration` altına yeni bir `.test.js` dosyası ekleyin. Supertest, HTTP istekleri yapmanızı ve yanıtları doğrulamanızı kolaylaştırır.

---

### Genel Kurallar

*   Yazdığınız her yeni özellik veya hata düzeltmesi için ilgili testleri de eklemelisiniz.
*   Testleriniz, kodun sadece "mutlu yolu"nu (happy path) değil, aynı zamanda hatalı girdiler veya beklenmedik durumlar gibi "kenar durumları"nı (edge cases) da kapsamalıdır.
*   Commit atmadan önce, eklediğiniz kodla ilgili testlerin tümünün başarıyla geçtiğinden emin olun. CI/CD sürecimiz, testleri geçmeyen kodların birleştirilmesini engelleyecektir.
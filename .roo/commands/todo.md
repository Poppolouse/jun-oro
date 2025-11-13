# todo command — assistant guideline

Bu dosya, `todo` komutu çalıştırıldığında Assistant tarafından kullanılır.
Amaç: proje içindeki `yapsana.md` dosyasını kontrol edip yapılacak işleri sırayla tamamlamak ve `yapsana.md`'yi her adımda güncellemek.

Dosya referansı:

- C:\Users\ardat\Desktop\code\Neuer Ordner\jun-oro\yapsana.md

İş akışı:

1. Assistant `yapsana.md`'yi okur ve ilk tamamlanmamış (unchecked) öğeyi bulur.
2. Eğer öğe "fazlar" (phase) olarak gruplanmışsa, Assistant yalnızca o fazdaki tüm öğeleri tamamlayıp durur.
3. Aksi halde, Assistant tek bir işlemi tamamlar.
4. Her tamamlanan işlemden sonra Assistant `yapsana.md`'yi günceller: ilgili öğeyi [x] ile işaretler ve gerekirse not ekler.
5. İşlem tamamlandıktan sonra Assistant durumu bildirir ve devam için kullanıcıdan `todo` komutunu bekler.

Güncelleme kuralları:

- Tamamlanan öğeler: "- [ ]" → "- [x]" ve tarih/özet eklensin (opsiyonel).
- Yeni bulunan görevler varsa, Assistant bunları aynı dosyada yeni maddeler olarak ekler.
- Faz tamamlandıysa, faz başlığı altında tüm maddeler işaretlenir ve bir kısa not bırakılır.

Örnek not formatı:

- [x] Implement notifications pagination in AdminNotifications — done 2025-11-06 (updated by assistant)

Kısıtlar:

- Assistant yalnızca workspace içindeki `yapsana.md` üzerinden durum tutar.
- Her araç çağrısından sonra kullanıcıdan tool-execution onayı bekleriz (VSCode entegrasyonu gereği).

Davranış beklentisi:

- Her işlem sonrası aynı `yapsana.md` güncellenecek.
- Faz tabanlı işleri sırayla tamamla, faz tamamlandığında dur.

İletişim:

- Komutu başlatmak için `todo` yazın.

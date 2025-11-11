// Test scripti: localStorage'ı temizleyip test kullanıcısını ekle
// Browser console'da çalıştırılacak

console.log("🔧 localStorage temizleniyor...");
localStorage.clear();

// Test kullanıcısını ekle
const testUserId = "cmhgw07lm0000v8iwpp16e5wo";
localStorage.setItem("arkade_current_user", JSON.stringify({ id: testUserId }));

console.log("✅ Test kullanıcısı eklendi:", testUserId);
console.log("📦 localStorage:", localStorage.getItem("arkade_current_user"));

// Sayfayı yenile
console.log("🔄 Sayfa yenileniyor...");
window.location.reload();

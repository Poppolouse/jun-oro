// test-hltb.js
import howlongtobeat from 'howlongtobeat-api';

async function test() {
  try {
    console.log('🔍 Elden Ring aranıyor...\n');
    
    const results = await howlongtobeat.find({ search: 'Elden Ring' });
    
    if (!results.data || results.data.length === 0) {
      console.log('❌ Sonuç bulunamadı!');
      return;
    }
    
    console.log(`✅ ${results.total} toplam sonuç, ${results.data.length} tanesi gösteriliyor!\n`);
    
    // İlk 3 sonucu göster
    results.data.slice(0, 3).forEach((game, index) => {
      console.log(`\n🎮 ${index + 1}. ${game.name}`);
      console.log(`   ID: ${game.id}`);
      console.log(`   Ana Hikaye: ${game.main || 'N/A'}`);
      console.log(`   Ana + Extra: ${game.mainExtra || 'N/A'}`);
      console.log(`   Completionist: ${game.completionist || 'N/A'}`);
      console.log(`   Platform: ${game.platforms || 'N/A'}`);
      console.log(`   Yıl: ${game.releaseDate || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();
import { HowLongToBeatService } from 'hltb-js';

async function testHltb() {
  console.log('Yeni HLTB servisi (hltb-js) test ediliyor...');
  const hltbService = new HowLongToBeatService();
  const gameNameToSearch = 'Elden Ring';

  try {
    console.log(`'${gameNameToSearch}' için arama yapılıyor...`);
    const result = await hltbService.search(gameNameToSearch);

    if (result && result.length > 0) {
      console.log('Başarılı! Sonuçlar bulundu:');
      // Sadece en alakalı ilk sonucu ve bizim için önemli olan alanları gösterelim.
      const game = result[0];
      const relevantData = {
        name: game.name,
        imageUrl: game.imageUrl,
        gameplayMain: game.gameplayMain,
        gameplayMainExtra: game.gameplayMainExtra,
        gameplayCompletionist: game.gameplayCompletionist,
      };
      console.log(JSON.stringify(relevantData, null, 2));
    } else {
      console.log('Sonuç bulunamadı.');
    }
  } catch (error) {
    console.error('HLTB verisi çekilirken bir hata oluştu:', error);
  }
}

testHltb();
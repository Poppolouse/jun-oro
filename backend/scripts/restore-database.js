import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function restoreDatabase(backupFilePath) {
  try {
    console.log('🔄 Veritabanı geri yükleme başlatılıyor...')
    
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Yedek dosyası bulunamadı: ${backupFilePath}`)
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'))
    
    if (!backupData.data) {
      throw new Error('Geçersiz yedek dosyası formatı')
    }
    
    console.log(`📅 Yedek tarihi: ${backupData.timestamp}`)
    console.log(`📊 Geri yüklenecek veriler:`)
    console.log(`   - Kullanıcılar: ${backupData.data.users?.length || 0}`)
    console.log(`   - Oyunlar: ${backupData.data.games?.length || 0}`)
    console.log(`   - Oyun Oturumları: ${backupData.data.gameSessions?.length || 0}`)
    
    // Güvenlik onayı
    if (process.env.FORCE_RESTORE !== 'true') {
      console.log('\n⚠️  DİKKAT: Bu işlem mevcut veritabanını tamamen değiştirecek!')
      console.log('Devam etmek için "RESTORE" yazın:')
      
      // Eğer script interaktif çalışıyorsa onay iste
      if (process.stdin.isTTY) {
        const readline = await import('readline')
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        })
        
        const answer = await new Promise(resolve => {
          rl.question('> ', resolve)
        })
        rl.close()
        
        if (answer !== 'RESTORE') {
          console.log('❌ Geri yükleme iptal edildi')
          return { success: false, message: 'İptal edildi' }
        }
      } else {
        console.log('❌ İnteraktif olmayan ortamda onay alınamadı. FORCE_RESTORE=true ortam değişkenini kullanın.')
        return { success: false, message: 'Onay gerekli' }
      }
    }
    
    // Transaction içinde geri yükleme yap
    await prisma.$transaction(async (tx) => {
      // Mevcut verileri temizle (foreign key constraints nedeniyle sıralı)
      await tx.gameSession.deleteMany()
      await tx.user_libraries.deleteMany()
      await tx.notification.deleteMany()
      await tx.changelog.deleteMany()
      await tx.userStats.deleteMany()
      await tx.userPreferences.deleteMany()
      await tx.user.deleteMany()
      await tx.game.deleteMany()
      
      console.log('🗑️ Mevcut veriler temizlendi')
      
      // Yeni verileri ekle
      if (backupData.data.games?.length > 0) {
        await tx.game.createMany({ data: backupData.data.games })
        console.log(`✅ ${backupData.data.games.length} oyun geri yüklendi`)
      }
      
      if (backupData.data.users?.length > 0) {
        // Kullanıcıları ve ilişkili verileri geri yükle
        for (const user of backupData.data.users) {
          const { preferences, userStats, ...userData } = user
          
          const createdUser = await tx.user.create({
            data: userData
          })
          
          if (preferences) {
            await tx.userPreferences.create({
              data: {
                ...preferences,
                userId: createdUser.id
              }
            })
          }
          
          if (userStats) {
            await tx.userStats.create({
              data: {
                ...userStats,
                userId: createdUser.id
              }
            })
          }
        }
        console.log(`✅ ${backupData.data.users.length} kullanıcı geri yüklendi`)
      }
      
      if (backupData.data.gameSessions?.length > 0) {
        await tx.gameSession.createMany({ data: backupData.data.gameSessions })
        console.log(`✅ ${backupData.data.gameSessions.length} oyun oturumu geri yüklendi`)
      }
      
      if (backupData.data.userLibraries?.length > 0) {
        await tx.user_libraries.createMany({ data: backupData.data.userLibraries })
        console.log(`✅ ${backupData.data.userLibraries.length} kütüphane kaydı geri yüklendi`)
      }
      
      if (backupData.data.notifications?.length > 0) {
        await tx.notification.createMany({ data: backupData.data.notifications })
        console.log(`✅ ${backupData.data.notifications.length} bildirim geri yüklendi`)
      }
      
      if (backupData.data.changelog?.length > 0) {
        await tx.changelog.createMany({ data: backupData.data.changelog })
        console.log(`✅ ${backupData.data.changelog.length} changelog geri yüklendi`)
      }
    })
    
    console.log('✅ Veritabanı geri yükleme tamamlandı!')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Veritabanı geri yükleme hatası:', error)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

// Script doğrudan çalıştırılırsa
if (import.meta.url === `file://${process.argv[1]}`) {
  let backupFile = process.argv[2]
  if (!backupFile) {
    console.log('ℹ️ Yedek dosyası belirtilmedi, en son yedek aranıyor...');
    const backupsDir = path.join(path.dirname(process.argv[1]), '..\', 'backups');
    const backupFiles = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => fs.statSync(path.join(backupsDir, b)).mtime.getTime() - fs.statSync(path.join(backupsDir, a)).mtime.getTime());

    if (backupFiles.length === 0) {
      console.error('❌ backups klasöründe hiç yedek dosyası bulunamadı.');
      process.exit(1);
    }
    backupFile = path.join(backupsDir, backupFiles[0]);
    console.log(`✅ En son yedek bulundu: ${backupFiles[0]}`);
  }
  restoreDatabase(backupFile)
}

export { restoreDatabase }
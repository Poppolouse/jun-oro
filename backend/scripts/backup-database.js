import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log("🔄 Veritabanı yedekleme başlatılıyor...");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(process.cwd(), "backups");

    // Backup klasörünü oluştur
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    // Tüm tabloları yedekle
    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        users: await prisma.user.findMany({
          include: {
            preferences: true,
            userStats: true,
          },
        }),
        games: await prisma.game.findMany(),
        gameSessions: await prisma.gameSession.findMany(),
        userLibraries: await prisma.user_libraries.findMany(),
        notifications: await prisma.notification.findMany(),
        changelog: await prisma.changelog.findMany(),
      },
    };

    // JSON dosyasına yaz
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    console.log(`✅ Veritabanı yedekleme tamamlandı: ${backupFile}`);
    console.log(`📊 Yedeklenen veriler:`);
    console.log(`   - Kullanıcılar: ${backup.data.users.length}`);
    console.log(`   - Oyunlar: ${backup.data.games.length}`);
    console.log(`   - Oyun Oturumları: ${backup.data.gameSessions.length}`);
    console.log(
      `   - Kullanıcı Kütüphaneleri: ${backup.data.userLibraries.length}`,
    );
    console.log(`   - Bildirimler: ${backup.data.notifications.length}`);
    console.log(`   - Changelog: ${backup.data.changelog.length}`);

    // Eski yedekleri temizle (30 günden eski olanları)
    const files = fs.readdirSync(backupDir);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let deletedCount = 0;
    files.forEach((file) => {
      if (file.startsWith("backup-") && file.endsWith(".json")) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    });

    if (deletedCount > 0) {
      console.log(`🗑️ ${deletedCount} eski yedek dosyası temizlendi`);
    }

    return { success: true, backupFile, stats: backup.data };
  } catch (error) {
    console.error("❌ Veritabanı yedekleme hatası:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Script doğrudan çalıştırılırsa
if (import.meta.url === `file://${process.argv[1]}`) {
  backupDatabase();
}

export { backupDatabase };

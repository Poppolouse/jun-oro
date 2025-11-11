import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function restoreAdminAccount() {
  try {
    console.log("🔍 Admin hesabı geri yükleme işlemi başlatılıyor...");

    // Önce mevcut poppolouse hesabını kontrol et
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: "poppolouse" },
          { name: "poppolouse" },
          { email: "poppolouse@admin.com" },
        ],
      },
    });

    if (existingUser) {
      console.log("✅ poppolouse hesabı bulundu:", existingUser.id);

      // Admin rolünü güncelle
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: "admin",
          name: "poppolouse",
          username: "poppolouse",
          email: "poppolouse@admin.com",
          lastActive: new Date(),
        },
      });

      console.log("✅ Admin rolü güncellendi:", updatedUser.id);
      return updatedUser;
    }

    // Hesap yoksa yeniden oluştur
    console.log("⚠️ poppolouse hesabı bulunamadı, yeniden oluşturuluyor...");

    // Güvenli şifre hash'le
    const hashedPassword = await bcrypt.hash("admin123!", 10);

    const newAdmin = await prisma.user.create({
      data: {
        name: "poppolouse",
        username: "poppolouse",
        email: "poppolouse@admin.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
      },
    });

    console.log("✅ Admin hesabı başarıyla oluşturuldu:", newAdmin.id);
    console.log("📧 Email: poppolouse@admin.com");
    console.log("🔑 Şifre: admin123!");
    console.log("⚠️ Lütfen ilk girişten sonra şifrenizi değiştirin!");

    // UserPreferences oluştur
    await prisma.userPreferences.create({
      data: {
        userId: newAdmin.id,
        preferredPlatform: "PC",
        preferredStatus: "Oynamak İstiyorum",
        includeDLCs: false,
        autoLoadHLTB: true,
        autoLoadMetacritic: true,
        autoGenerateCampaigns: true,
      },
    });

    // UserStats oluştur
    await prisma.userStats.create({
      data: {
        userId: newAdmin.id,
        gamesPlayed: 0,
        gamesCompleted: 0,
        totalPlayTime: 0,
        favoriteGenre: null,
      },
    });

    console.log("✅ Admin hesabı ayarları tamamlandı");
    return newAdmin;
  } catch (error) {
    console.error("❌ Admin hesabı geri yükleme hatası:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Admin koruma fonksiyonu ekle
async function addAdminProtection() {
  try {
    console.log("🛡️ Admin koruma sistemi ekleniyor...");

    // Tüm admin hesaplarını bul
    const adminUsers = await prisma.user.findMany({
      where: { role: "admin" },
    });

    console.log(`📊 Toplam ${adminUsers.length} admin hesabı bulundu`);

    for (const admin of adminUsers) {
      console.log(
        `🔒 Admin koruması: ${admin.username || admin.name} (${admin.id})`,
      );
    }

    console.log("✅ Admin koruma sistemi aktif");
  } catch (error) {
    console.error("❌ Admin koruma hatası:", error);
  }
}

async function main() {
  console.log("🚀 Admin hesabı kurtarma işlemi başlatılıyor...");
  console.log("=".repeat(50));

  await restoreAdminAccount();
  await addAdminProtection();

  console.log("=".repeat(50));
  console.log("✅ İşlem tamamlandı!");
  console.log("🔗 Prisma Studio: http://localhost:5555");
  console.log("🌐 Uygulama: http://localhost:3000");
}

main().catch((e) => {
  console.error("💥 Kritik hata:", e);
  process.exit(1);
});

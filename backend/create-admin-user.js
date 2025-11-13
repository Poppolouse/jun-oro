import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Environment variables'ı yükle
dotenv.config();

const prisma = new PrismaClient();

/**
 * "poppolouse" kullanıcı adıyla admin kullanıcı oluşturan script
 * Şifre: "123Ardat123"
 */
async function createAdminUser() {
  try {
    console.log("🔍 Admin kullanıcı oluşturma işlemi başlatılıyor...");
    console.log("=".repeat(60));

    const USERNAME = "poppolouse";
    const PASSWORD = "123Ardat123";
    const EMAIL = "poppolouse@jun-oro.com";
    const ROLE = "admin";

    // Önce kullanıcının var olup olmadığını kontrol et
    console.log("📋 Mevcut kullanıcı kontrol ediliyor...");
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: USERNAME }, { email: EMAIL }],
      },
    });

    if (existingUser) {
      console.log("⚠️ Kullanıcı zaten mevcut:");
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Kullanıcı adı: ${existingUser.username}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Mevcut rol: ${existingUser.role}`);

      // Eğer kullanıcı varsa ve admin değilse, rolünü güncelle
      if (existingUser.role !== "admin") {
        console.log("🔄 Kullanıcının rolü 'admin' olarak güncelleniyor...");

        // Şifreyi hash'le
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");
        const hashedPassword = await bcrypt.hash(PASSWORD, saltRounds);

        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: ROLE,
            password: hashedPassword,
            status: "active",
            lastActive: new Date(),
            updatedAt: new Date(),
          },
        });

        console.log("✅ Kullanıcı başarıyla admin olarak güncellendi:");
        console.log(`   ID: ${updatedUser.id}`);
        console.log(`   Kullanıcı adı: ${updatedUser.username}`);
        console.log(`   Rol: ${updatedUser.role}`);
        console.log(`   Durum: ${updatedUser.status}`);

        return updatedUser;
      } else {
        console.log(
          "ℹ️ Kullanıcı zaten admin rolüne sahip, güncelleme gerekmiyor.",
        );
        return existingUser;
      }
    }

    // Yeni kullanıcı oluştur
    console.log("👤 Yeni admin kullanıcı oluşturuluyor...");

    // Şifreyi hash'le
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");
    console.log(`🔐 Şifre hash'leniyor (salt rounds: ${saltRounds})...`);
    const hashedPassword = await bcrypt.hash(PASSWORD, saltRounds);

    // Kullanıcıyı oluştur
    const newAdmin = await prisma.user.create({
      data: {
        name: USERNAME,
        username: USERNAME,
        email: EMAIL,
        password: hashedPassword,
        role: ROLE,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
      },
    });

    console.log("✅ Admin kullanıcı başarıyla oluşturuldu:");
    console.log(`   ID: ${newAdmin.id}`);
    console.log(`   Kullanıcı adı: ${newAdmin.username}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Rol: ${newAdmin.role}`);
    console.log(`   Durum: ${newAdmin.status}`);

    // UserPreferences oluştur
    console.log("⚙️ Kullanıcı tercihleri oluşturuluyor...");
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
    console.log("📊 Kullanıcı istatistikleri oluşturuluyor...");
    await prisma.userStats.create({
      data: {
        userId: newAdmin.id,
        totalPlayTime: 0,
        totalSessions: 0,
        gamesPlayed: 0,
        gamesCompleted: 0,
      },
    });

    console.log("✅ Admin kullanıcı kurulumu tamamlandı!");
    console.log("=".repeat(60));
    console.log("📋 Giriş Bilgileri:");
    console.log(`   Kullanıcı adı: ${USERNAME}`);
    console.log(`   Şifre: ${PASSWORD}`);
    console.log(`   Email: ${EMAIL}`);
    console.log(`   Rol: ${ROLE}`);
    console.log("⚠️ Lütfen ilk girişten sonra şifrenizi değiştirin!");

    return newAdmin;
  } catch (error) {
    console.error("❌ Admin kullanıcı oluşturma hatası:", error);

    // Hata detaylarını logla
    if (error.code) {
      console.error(`   Hata kodu: ${error.code}`);
    }
    if (error.message) {
      console.error(`   Hata mesajı: ${error.message}`);
    }

    throw error;
  } finally {
    // Prisma bağlantısını kapat
    await prisma.$disconnect();
    console.log("🔌 Veritabanı bağlantısı kapatıldı.");
  }
}

/**
 * Script'in çalıştırıldığını doğrular
 */
async function verifyEnvironment() {
  console.log("🔍 Environment kontrolü yapılıyor...");

  const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "BCRYPT_SALT_ROUNDS"];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.error("❌ Eksik environment değişkenleri:");
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error(
      "\nLütfen .env dosyasını kontrol edin ve eksik değişkenleri ekleyin.",
    );
    process.exit(1);
  }

  console.log("✅ Environment değişkenleri tamam.");
}

/**
 * Ana fonksiyon
 */
async function main() {
  console.log("🚀 Jun-Oro Admin Kullanıcı Oluşturma Script'i");
  console.log("📅 Tarih:", new Date().toLocaleString("tr-TR"));
  console.log("=".repeat(60));

  try {
    // Environment kontrolü
    await verifyEnvironment();

    // Admin kullanıcı oluştur
    await createAdminUser();

    console.log("=".repeat(60));
    console.log("✅ İşlem başarıyla tamamlandı!");
    console.log("🌐 Uygulamayı başlatmak için: npm run dev");
    console.log("🔗 Prisma Studio: npx prisma studio");
  } catch (error) {
    console.error("💥 Kritik hata:", error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
main().catch((error) => {
  console.error("💥 Script çalıştırma hatası:", error);
  process.exit(1);
});

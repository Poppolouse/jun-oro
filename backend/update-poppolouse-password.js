import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function updatePoppolouserPassword() {
  try {
    console.log('🔍 Poppolouse kullanıcısı aranıyor...')
    
    // Poppolouse kullanıcısını bul
    const user = await prisma.user.findFirst({
      where: {
        username: 'poppolouse'
      }
    })

    if (!user) {
      console.log('❌ Poppolouse kullanıcısı bulunamadı!')
      return
    }

    console.log(`✅ Kullanıcı bulundu: ${user.username} (ID: ${user.id})`)

    // Yeni şifreyi hashle
    const newPassword = '123Ardat123'
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Şifreyi güncelle
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: hashedPassword
      }
    })

    console.log('🎉 Poppolouse kullanıcısının şifresi başarıyla güncellendi!')
    console.log(`📝 Yeni şifre: ${newPassword}`)

  } catch (error) {
    console.error('❌ Şifre güncelleme hatası:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePoppolouserPassword()
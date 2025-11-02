import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updateUser() {
  try {
    // Hash the password
    const password = '123Ardat123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update poppolouse user
    const updatedUser = await prisma.user.update({
      where: {
        username: 'poppolouse'
      },
      data: {
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('✅ User updated successfully:', {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      hasPassword: !!updatedUser.password
    });

  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUser();
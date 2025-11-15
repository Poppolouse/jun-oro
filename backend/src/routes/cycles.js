import express from 'express';
import { PrismaClient } from '@prisma/client';
import { jwtAuthMiddleware } from '../middleware/jwtAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Tüm döngüleri getir
router.get('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const cycles = await prisma.cycle.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { status: 'asc' }, // active önce
        { createdAt: 'desc' }
      ]
    });

    res.json({ cycles });
  } catch (error) {
    console.error('Döngüler getirilemedi:', error);
    
    // Eğer tablo yoksa migration yapılması gerektiğini belirt
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      return res.status(503).json({ 
        error: 'Veritabanı migration yapılması gerekiyor',
        details: 'Lütfen backend klasöründe "npx prisma migrate dev" komutunu çalıştırın',
        migrationRequired: true
      });
    }
    
    res.status(500).json({ 
      error: 'Döngüler yüklenirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Yeni döngü oluştur
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const { name, description, gameIds = [] } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Döngü adı gereklidir' });
    }

    const cycle = await prisma.cycle.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        gameIds: JSON.stringify(gameIds),
        status: 'planned'
      }
    });

    res.status(201).json(cycle);
  } catch (error) {
    console.error('Döngü oluşturulamadı:', error);
    res.status(500).json({ 
      error: 'Döngü oluşturulurken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Belirli bir döngüyü getir
router.get('/:cycleId', jwtAuthMiddleware, async (req, res) => {
  try {
    const { cycleId } = req.params;

    const cycle = await prisma.cycle.findFirst({
      where: { 
        id: cycleId,
        userId: req.user.id 
      }
    });

    if (!cycle) {
      return res.status(404).json({ error: 'Döngü bulunamadı' });
    }

    res.json(cycle);
  } catch (error) {
    console.error('Döngü getirilemedi:', error);
    res.status(500).json({ 
      error: 'Döngü yüklenirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Döngüyü güncelle
router.patch('/:cycleId', jwtAuthMiddleware, async (req, res) => {
  try {
    const { cycleId } = req.params;
    const { name, description, gameIds, status } = req.body;

    // Döngünün kullanıcıya ait olduğunu kontrol et
    const existingCycle = await prisma.cycle.findFirst({
      where: { 
        id: cycleId,
        userId: req.user.id 
      }
    });

    if (!existingCycle) {
      return res.status(404).json({ error: 'Döngü bulunamadı' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (gameIds !== undefined) updateData.gameIds = JSON.stringify(gameIds);
    if (status !== undefined) {
      if (!['planned', 'active', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Geçersiz durum değeri' });
      }
      updateData.status = status;
      
      if (status === 'active') {
        updateData.startedAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }

    const cycle = await prisma.cycle.update({
      where: { id: cycleId },
      data: updateData
    });

    res.json(cycle);
  } catch (error) {
    console.error('Döngü güncellenemedi:', error);
    res.status(500).json({ 
      error: 'Döngü güncellenirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Döngüyü sil
router.delete('/:cycleId', jwtAuthMiddleware, async (req, res) => {
  try {
    const { cycleId } = req.params;

    // Döngünün kullanıcıya ait olduğunu kontrol et
    const existingCycle = await prisma.cycle.findFirst({
      where: { 
        id: cycleId,
        userId: req.user.id 
      }
    });

    if (!existingCycle) {
      return res.status(404).json({ error: 'Döngü bulunamadı' });
    }

    await prisma.cycle.delete({
      where: { id: cycleId }
    });

    res.json({ message: 'Döngü silindi' });
  } catch (error) {
    console.error('Döngü silinemedi:', error);
    res.status(500).json({ 
      error: 'Döngü silinirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Döngüyü aktif et (diğer aktif döngüler planned olur)
router.post('/:cycleId/activate', jwtAuthMiddleware, async (req, res) => {
  try {
    const { cycleId } = req.params;

    // Döngünün kullanıcıya ait olduğunu kontrol et
    const existingCycle = await prisma.cycle.findFirst({
      where: { 
        id: cycleId,
        userId: req.user.id 
      }
    });

    if (!existingCycle) {
      return res.status(404).json({ error: 'Döngü bulunamadı' });
    }

    // Transaction ile diğer aktif döngüleri planned yap
    await prisma.$transaction([
      // Tüm aktif döngüleri planned yap
      prisma.cycle.updateMany({
        where: {
          userId: req.user.id,
          status: 'active'
        },
        data: { status: 'planned' }
      }),
      // Bu döngüyü active yap
      prisma.cycle.update({
        where: { id: cycleId },
        data: { 
          status: 'active',
          startedAt: new Date()
        }
      })
    ]);

    const updatedCycle = await prisma.cycle.findUnique({
      where: { id: cycleId }
    });

    res.json(updatedCycle);
  } catch (error) {
    console.error('Döngü aktifleştirilemedi:', error);
    res.status(500).json({ 
      error: 'Döngü aktifleştirilirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

export default router;

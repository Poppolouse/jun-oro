import express from 'express';
import { prisma } from '../lib/prisma.js';
import { jwtAuthMiddleware } from '../middleware/jwtAuth.js';
import { clearCacheByKey } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Tüm döngüleri getir
router.get('/', jwtAuthMiddleware, async (req, res) => {
  console.log('📡 [GET /cycles] İstek alındı, userId:', req.user.id, 'username:', req.user.username);
  
  try {
    const allCycles = await prisma.cycle.findMany({
      where: { userId: req.user.id }
    });
    
    console.log('🔍 [GET /cycles] DB toplam döngü sayısı:', allCycles.length);
    
    const cycles = await prisma.cycle.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { status: 'asc' }, // active önce
        { createdAt: 'desc' }
      ]
    });

    console.log('✅ [GET /cycles] Döngüler bulundu:', {
      count: cycles.length,
      cycles: cycles.map(c => ({ 
        id: c.id, 
        name: c.name, 
        status: c.status, 
        userId: c.userId,
        gameIds: c.gameIds 
      }))
    });

    res.json({ cycles });
  } catch (error) {
    console.error('❌ [GET /cycles] Hata:', error.message);
    
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
  console.log('📡 [POST /cycles] İstek alındı:', {
    userId: req.user.id,
    username: req.user.username,
    body: req.body
  });
  
  try {
    const { name, description, gameIds = [] } = req.body;

    if (!name || name.trim().length === 0) {
      console.log('⚠️ [POST /cycles] Döngü adı boş');
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

    console.log('✅ [POST /cycles] Döngü oluşturuldu:', {
      id: cycle.id,
      name: cycle.name,
      status: cycle.status,
      userId: cycle.userId
    });
    
    const totalCycles = await prisma.cycle.count({
      where: { userId: req.user.id }
    });
    console.log('📊 [POST /cycles] Kullanıcının toplam döngü sayısı:', totalCycles);

    clearCacheByKey('GET:/api/cycles:');
    res.status(201).json(cycle);
  } catch (error) {
    console.error('❌ [POST /cycles] Hata:', error.message);
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

    clearCacheByKey('GET:/api/cycles:');
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

    clearCacheByKey('GET:/api/cycles:');
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
  console.log('🎯 [POST /cycles/:id/activate] İstek alındı:', {
    cycleId: req.params.cycleId,
    userId: req.user.id,
    username: req.user.username
  });
  
  try {
    const { cycleId } = req.params;

    const existingCycle = await prisma.cycle.findFirst({
      where: { 
        id: cycleId,
        userId: req.user.id 
      }
    });

    if (!existingCycle) {
      console.log('⚠️ [POST /cycles/:id/activate] Döngü bulunamadı');
      return res.status(404).json({ error: 'Döngü bulunamadı' });
    }

    console.log('📝 [POST /cycles/:id/activate] Mevcut döngü:', {
      id: existingCycle.id,
      name: existingCycle.name,
      currentStatus: existingCycle.status,
      userId: existingCycle.userId
    });

    const currentlyActive = await prisma.cycle.findMany({
      where: {
        userId: req.user.id,
        status: 'active'
      }
    });

    console.log('🔍 [POST /cycles/:id/activate] Şu an aktif döngüler:', {
      count: currentlyActive.length,
      ids: currentlyActive.map(c => c.id)
    });

    const countBefore = await prisma.cycle.count({
      where: { userId: req.user.id }
    });
    console.log('📊 [BEFORE] Kullanıcının toplam döngü sayısı:', countBefore);

    const [deactivated, activated] = await prisma.$transaction([
      prisma.cycle.updateMany({
        where: {
          userId: req.user.id,
          status: 'active'
        },
        data: { status: 'planned' }
      }),
      prisma.cycle.update({
        where: { id: cycleId },
        data: { 
          status: 'active',
          startedAt: new Date()
        }
      })
    ]);

    console.log('✅ [POST /cycles/:id/activate] Transaction tamamlandı:', {
      deactivatedCount: deactivated.count,
      activated: {
        id: activated.id,
        name: activated.name,
        status: activated.status,
        userId: activated.userId
      }
    });

    const countAfter = await prisma.cycle.count({
      where: { userId: req.user.id }
    });
    console.log('📊 [AFTER] Kullanıcının toplam döngü sayısı:', countAfter);
    
    if (countBefore !== countAfter) {
      console.error('🚨 [POST /cycles/:id/activate] UYARI: Döngü sayısı değişti!', {
        before: countBefore,
        after: countAfter,
        diff: countAfter - countBefore
      });
    }

    const allCyclesAfter = await prisma.cycle.findMany({
      where: { userId: req.user.id }
    });

    console.log('🔍 [POST /cycles/:id/activate] İşlem sonrası tüm döngüler:', {
      count: allCyclesAfter.length,
      statuses: allCyclesAfter.map(c => ({ id: c.id, name: c.name, status: c.status, userId: c.userId }))
    });

    clearCacheByKey('GET:/api/cycles:');
    res.json(activated);
  } catch (error) {
    console.error('❌ [POST /cycles/:id/activate] Hata:', error.message);
    res.status(500).json({ 
      error: 'Döngü aktifleştirilirken bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

export default router;
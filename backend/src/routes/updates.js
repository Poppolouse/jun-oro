import express from 'express';
import { prisma } from '../lib/prisma.js';
import { 
  createUpdateSchema, 
  updateUpdateSchema, 
  createUpdateStepSchema,
  updateUpdateStepSchema,
  idParamSchema 
} from '../lib/validation.js';

const router = express.Router();

// Helper function to calculate progress from substeps
const calculateProgressFromSubsteps = async (updateId) => {
  const substeps = await prisma.systemUpdateStep.findMany({
    where: { updateId }
  });
  
  if (substeps.length === 0) return null;
  
  const totalProgress = substeps.reduce((sum, step) => sum + step.progress, 0);
  return Math.round(totalProgress / substeps.length);
};

// GET /api/updates - Get all system updates
router.get('/', async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [updates, total] = await Promise.all([
      prisma.systemUpdate.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          substeps: {
            orderBy: { order: 'asc' }
          }
        }
      }),
      prisma.systemUpdate.count({ where })
    ]);

    res.json({
      success: true,
      data: updates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/updates/homepage - Get updates for homepage display
router.get('/homepage', async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    // Get recent completed updates and current in-progress updates
    const [recentUpdates, inProgressUpdates] = await Promise.all([
      prisma.systemUpdate.findMany({
        where: {
          status: 'completed'
        },
        take: parseInt(limit),
        orderBy: { completedAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          status: true,
          version: true,
          completedAt: true,
          createdAt: true,
          substeps: {
            select: {
              id: true,
              title: true,
              progress: true,
              status: true
            },
            orderBy: { order: 'asc' }
          }
        }
      }),
      prisma.systemUpdate.findMany({
        where: {
          status: 'in_progress'
        },
        take: 3,
        orderBy: { progress: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          status: true,
          progress: true,
          priority: true,
          createdAt: true,
          substeps: {
            select: {
              id: true,
              title: true,
              progress: true,
              status: true
            },
            orderBy: { order: 'asc' }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        recent: recentUpdates,
        inProgress: inProgressUpdates
      }
    });
  } catch (error) {
    next(error);
  }
});

// SUBSTEP ENDPOINTS - Must be before /:updateId routes

// GET /api/updates/:updateId/substeps - Get all substeps for an update
router.get('/:updateId/substeps', async (req, res, next) => {
  try {
    const updateId = req.params.updateId;
    
    if (!updateId) {
      return res.status(400).json({
        success: false,
        message: 'Update ID is required'
      });
    }

    const substeps = await prisma.systemUpdateStep.findMany({
      where: { updateId },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: substeps
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/updates/:updateId/substeps - Create new substep
router.post('/:updateId/substeps', async (req, res, next) => {
  try {
    const updateId = req.params.updateId;
    
    if (!updateId) {
      return res.status(400).json({
        success: false,
        message: 'Update ID is required'
      });
    }
    
    const validatedData = createUpdateStepSchema.parse(req.body);

    // Get the highest order number for this update
    const lastStep = await prisma.systemUpdateStep.findFirst({
      where: { updateId },
      orderBy: { order: 'desc' }
    });

    const substep = await prisma.systemUpdateStep.create({
      data: {
        ...validatedData,
        updateId,
        order: validatedData.order || (lastStep ? lastStep.order + 1 : 0)
      }
    });

    // Recalculate parent update progress
    const calculatedProgress = await calculateProgressFromSubsteps(updateId);
    if (calculatedProgress !== null) {
      await prisma.systemUpdate.update({
        where: { id: updateId },
        data: { progress: calculatedProgress }
      });
    }

    res.status(201).json({
      success: true,
      data: substep,
      message: 'Substep created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/updates/:updateId/substeps/:stepId - Update substep
router.put('/:updateId/substeps/:stepId', async (req, res, next) => {
  try {
    const updateId = req.params.updateId;
    const stepId = req.params.stepId;
    
    // Validate IDs
    if (!updateId || !stepId) {
      return res.status(400).json({
        success: false,
        message: 'Update ID and Step ID are required'
      });
    }
    
    const validatedData = updateUpdateStepSchema.parse(req.body);

    // First check if the substep exists and belongs to this update
    const existingStep = await prisma.systemUpdateStep.findFirst({
      where: { 
        id: stepId,
        updateId: updateId
      }
    });

    if (!existingStep) {
      return res.status(404).json({
        success: false,
        message: 'Substep not found or does not belong to this update'
      });
    }

    const substep = await prisma.systemUpdateStep.update({
      where: { 
        id: stepId
      },
      data: validatedData
    });

    // Recalculate parent update progress
    const calculatedProgress = await calculateProgressFromSubsteps(updateId);
    if (calculatedProgress !== null) {
      await prisma.systemUpdate.update({
        where: { id: updateId },
        data: { progress: calculatedProgress }
      });
    }

    res.json({
      success: true,
      data: substep,
      message: 'Substep updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/updates/:updateId/substeps/:stepId - Delete substep
router.delete('/:updateId/substeps/:stepId', async (req, res, next) => {
  try {
    const updateId = req.params.updateId;
    const stepId = req.params.stepId;
    
    // Validate IDs
    if (!updateId || !stepId) {
      return res.status(400).json({
        success: false,
        message: 'Update ID and Step ID are required'
      });
    }

    // First check if the substep exists and belongs to this update
    const existingStep = await prisma.systemUpdateStep.findFirst({
      where: { 
        id: stepId,
        updateId: updateId
      }
    });

    if (!existingStep) {
      return res.status(404).json({
        success: false,
        message: 'Substep not found or does not belong to this update'
      });
    }

    await prisma.systemUpdateStep.delete({
      where: { 
        id: stepId
      }
    });

    // Recalculate parent update progress
    const calculatedProgress = await calculateProgressFromSubsteps(updateId);
    if (calculatedProgress !== null) {
      await prisma.systemUpdate.update({
        where: { id: updateId },
        data: { progress: calculatedProgress }
      });
    }

    res.json({
      success: true,
      message: 'Substep deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/updates/:updateId - Get specific update
router.get('/:updateId', async (req, res, next) => {
  try {
    const updateId = req.params.updateId;
    
    if (!updateId) {
      return res.status(400).json({
        success: false,
        message: 'Update ID is required'
      });
    }

    const update = await prisma.systemUpdate.findUnique({
      where: { id: updateId },
      include: {
        substeps: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    res.json({
      success: true,
      data: update
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/updates - Create new update
router.post('/', async (req, res, next) => {
  try {
    console.log('POST /updates - Request body:', JSON.stringify(req.body, null, 2));
    
    const validatedData = createUpdateSchema.parse(req.body);
    console.log('POST /updates - Validated data:', JSON.stringify(validatedData, null, 2));
    
    const { substeps, ...updateData } = validatedData;

    const update = await prisma.systemUpdate.create({
      data: {
        ...updateData,
        substeps: substeps ? {
          create: substeps.map((step, index) => ({
            ...step,
            order: step.order || index
          }))
        } : undefined
      },
      include: {
        substeps: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: update,
      message: 'Update created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/updates/:updateId - Update system update
router.put('/:updateId', async (req, res, next) => {
  try {
    const updateId = req.params.updateId;
    
    if (!updateId) {
      return res.status(400).json({
        success: false,
        message: 'Update ID is required'
      });
    }
    
    const validatedData = updateUpdateSchema.parse(req.body);
    const { substeps, ...updateData } = validatedData;

    // If substeps are provided, handle them separately
    if (substeps) {
      // Delete existing substeps and create new ones
      await prisma.systemUpdateStep.deleteMany({
        where: { updateId }
      });

      await prisma.systemUpdateStep.createMany({
        data: substeps.map((step, index) => ({
          ...step,
          updateId,
          order: step.order || index
        }))
      });

      // Calculate progress from substeps
      const calculatedProgress = await calculateProgressFromSubsteps(updateId);
      if (calculatedProgress !== null) {
        updateData.progress = calculatedProgress;
      }
    }

    const update = await prisma.systemUpdate.update({
      where: { id: updateId },
      data: updateData,
      include: {
        substeps: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      data: update,
      message: 'Update updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/updates/:updateId - Delete update
router.delete('/:updateId', async (req, res, next) => {
  try {
    const updateId = req.params.updateId;
    
    if (!updateId) {
      return res.status(400).json({
        success: false,
        message: 'Update ID is required'
      });
    }

    await prisma.systemUpdate.delete({
      where: { id: updateId }
    });

    res.json({
      success: true,
      message: 'Update deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/updates/roadmap/active - Get active roadmap items
router.get('/roadmap/active', async (req, res, next) => {
  try {
    const roadmapItems = await prisma.systemUpdate.findMany({
      where: {
        type: 'roadmap',
        status: {
          in: ['planned', 'in_progress']
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    // Group by status
    const grouped = {
      planned: roadmapItems.filter(item => item.status === 'planned'),
      in_progress: roadmapItems.filter(item => item.status === 'in_progress')
    };

    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/updates/changelog/recent - Get recent changelog entries
router.get('/changelog/recent', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const changelog = await prisma.systemUpdate.findMany({
      where: {
        type: 'changelog',
        status: 'completed'
      },
      take: parseInt(limit),
      orderBy: { releaseDate: 'desc' }
    });

    res.json({
      success: true,
      data: changelog
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/updates/:updateId/complete - Mark update as completed
router.post('/:updateId/complete', async (req, res, next) => {
  try {
    const updateId = req.params.updateId;
    
    if (!updateId) {
      return res.status(400).json({
        success: false,
        message: 'Update ID is required'
      });
    }
    
    const { completedAt, notes } = req.body;

    const update = await prisma.systemUpdate.update({
      where: { id: updateId },
      data: {
        status: 'completed',
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        progress: 100
      }
    });

    res.json({
      success: true,
      data: update,
      message: 'Update marked as completed'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/updates/:updateId/cancel - Cancel update
router.post('/:updateId/cancel', async (req, res, next) => {
  try {
    const updateId = req.params.updateId;
    
    if (!updateId) {
      return res.status(400).json({
        success: false,
        message: 'Update ID is required'
      });
    }
    
    const { reason } = req.body;

    const update = await prisma.systemUpdate.update({
      where: { id: updateId },
      data: {
        status: 'cancelled',
        notes: reason || 'Update cancelled'
      }
    });

    res.json({
      success: true,
      data: update,
      message: 'Update cancelled'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/updates/stats - Get update statistics
router.get('/stats', async (req, res, next) => {
  try {
    const [total, byStatus, byType] = await Promise.all([
      prisma.systemUpdate.count(),
      prisma.systemUpdate.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.systemUpdate.groupBy({
        by: ['type'],
        _count: { type: true }
      })
    ]);

    const statusStats = {};
    byStatus.forEach(item => {
      statusStats[item.status] = item._count.status;
    });

    const typeStats = {};
    byType.forEach(item => {
      typeStats[item.type] = item._count.type;
    });

    res.json({
      success: true,
      data: {
        total,
        byStatus: statusStats,
        byType: typeStats
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
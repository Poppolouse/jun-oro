import express from 'express';
import { prisma } from '../lib/prisma.js';
import { createCampaignSchema, updateCampaignSchema, idParamSchema } from '../lib/validation.js';

const router = express.Router();

// GET /api/campaigns/:gameId - Get campaigns for a game
router.get('/:gameId', async (req, res, next) => {
  try {
    const { gameId } = idParamSchema.parse({ id: req.params.gameId });

    const campaigns = await prisma.campaign.findMany({
      where: { gameId },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/campaigns/:gameId - Create campaign for a game
router.post('/:gameId', async (req, res, next) => {
  try {
    const { gameId } = idParamSchema.parse({ id: req.params.gameId });
    const validatedData = createCampaignSchema.parse(req.body);

    // Get the highest order number for this game
    const lastCampaign = await prisma.campaign.findFirst({
      where: { gameId },
      orderBy: { order: 'desc' }
    });

    const campaign = await prisma.campaign.create({
      data: {
        ...validatedData,
        gameId,
        order: (lastCampaign?.order || 0) + 1
      }
    });

    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/campaigns/:campaignId - Update campaign
router.put('/:campaignId', async (req, res, next) => {
  try {
    const { campaignId } = idParamSchema.parse({ id: req.params.campaignId });
    const validatedData = updateCampaignSchema.parse(req.body);

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: validatedData
    });

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/campaigns/:campaignId - Delete campaign
router.delete('/:campaignId', async (req, res, next) => {
  try {
    const { campaignId } = idParamSchema.parse({ id: req.params.campaignId });

    await prisma.campaign.delete({
      where: { id: campaignId }
    });

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/campaigns/:gameId/bulk - Create multiple campaigns
router.post('/:gameId/bulk', async (req, res, next) => {
  try {
    const { gameId } = idParamSchema.parse({ id: req.params.gameId });
    const { campaigns } = req.body;

    if (!Array.isArray(campaigns)) {
      return res.status(400).json({
        success: false,
        message: 'Campaigns must be an array'
      });
    }

    // Get the highest order number for this game
    const lastCampaign = await prisma.campaign.findFirst({
      where: { gameId },
      orderBy: { order: 'desc' }
    });

    let currentOrder = (lastCampaign?.order || 0) + 1;

    const createdCampaigns = [];
    for (const campaignData of campaigns) {
      const validatedData = createCampaignSchema.parse(campaignData);
      
      const campaign = await prisma.campaign.create({
        data: {
          ...validatedData,
          gameId,
          order: currentOrder++
        }
      });
      
      createdCampaigns.push(campaign);
    }

    res.status(201).json({
      success: true,
      data: createdCampaigns,
      message: `${createdCampaigns.length} campaigns created successfully`
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/campaigns/:gameId/reorder - Reorder campaigns
router.put('/:gameId/reorder', async (req, res, next) => {
  try {
    const { gameId } = idParamSchema.parse({ id: req.params.gameId });
    const { campaignIds } = req.body;

    if (!Array.isArray(campaignIds)) {
      return res.status(400).json({
        success: false,
        message: 'Campaign IDs must be an array'
      });
    }

    // Update order for each campaign
    const updatePromises = campaignIds.map((campaignId, index) =>
      prisma.campaign.update({
        where: { 
          id: campaignId,
          gameId // Ensure campaign belongs to this game
        },
        data: { order: index + 1 }
      })
    );

    await Promise.all(updatePromises);

    const campaigns = await prisma.campaign.findMany({
      where: { gameId },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: campaigns,
      message: 'Campaigns reordered successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/campaigns/:gameId/stats - Get campaign statistics
router.get('/:gameId/stats', async (req, res, next) => {
  try {
    const { gameId } = idParamSchema.parse({ id: req.params.gameId });

    const campaigns = await prisma.campaign.findMany({
      where: { gameId }
    });

    const stats = {
      total: campaigns.length,
      completed: campaigns.filter(c => c.status === 'Tamamlandı').length,
      inProgress: campaigns.filter(c => c.status === 'Devam Ediyor').length,
      notStarted: campaigns.filter(c => c.status === 'Başlanmadı').length,
      totalEstimatedTime: campaigns.reduce((sum, c) => sum + (c.estimatedTime || 0), 0),
      totalActualTime: campaigns.reduce((sum, c) => sum + (c.actualTime || 0), 0)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/campaigns/:campaignId/complete - Mark campaign as completed
router.post('/:campaignId/complete', async (req, res, next) => {
  try {
    const { campaignId } = idParamSchema.parse({ id: req.params.campaignId });
    const { actualTime, completedAt } = req.body;

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'Tamamlandı',
        actualTime: actualTime || undefined,
        completedAt: completedAt ? new Date(completedAt) : new Date()
      }
    });

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign marked as completed'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
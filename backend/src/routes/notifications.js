import express from 'express';
import { prisma } from '../lib/prisma.js';
import { createNotificationSchema, idParamSchema } from '../lib/validation.js';

const router = express.Router();

// GET /api/notifications/:userId - Get user notifications
router.get('/:userId', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { unread, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId };
    if (unread === 'true') {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      success: true,
      data: notifications,
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

// POST /api/notifications/:userId - Create notification
router.post('/:userId', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const validatedData = createNotificationSchema.parse(req.body);

    const notification = await prisma.notification.create({
      data: {
        ...validatedData,
        userId
      }
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:notificationId/read - Mark notification as read
router.put('/:notificationId/read', async (req, res, next) => {
  try {
    const { notificationId } = idParamSchema.parse({ id: req.params.notificationId });

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:userId/read-all - Mark all notifications as read
router.put('/:userId/read-all', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    const result = await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false
      },
      data: { 
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: { updatedCount: result.count },
      message: `${result.count} notifications marked as read`
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/:notificationId - Delete notification
router.delete('/:notificationId', async (req, res, next) => {
  try {
    const { notificationId } = idParamSchema.parse({ id: req.params.notificationId });

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/:userId/clear - Clear all notifications
router.delete('/:userId/clear', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { readOnly } = req.query;

    const where = { userId };
    if (readOnly === 'true') {
      where.isRead = true;
    }

    const result = await prisma.notification.deleteMany({ where });

    res.json({
      success: true,
      data: { deletedCount: result.count },
      message: `${result.count} notifications deleted`
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/:userId/unread-count - Get unread notification count
router.get('/:userId/unread-count', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/bulk - Create multiple notifications
router.post('/bulk', async (req, res, next) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications)) {
      return res.status(400).json({
        success: false,
        message: 'Notifications must be an array'
      });
    }

    const validatedNotifications = notifications.map(notification => 
      createNotificationSchema.parse(notification)
    );

    const createdNotifications = await prisma.notification.createMany({
      data: validatedNotifications
    });

    res.status(201).json({
      success: true,
      data: { count: createdNotifications.count },
      message: `${createdNotifications.count} notifications created successfully`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
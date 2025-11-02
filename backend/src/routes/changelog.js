import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET /api/changelog - Get all changelogs (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      published = 'true' 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      ...(type && { type }),
      ...(published === 'true' && { isPublished: true }),
      ...(published === 'false' && { isPublished: false })
      // published === 'all' durumunda hiçbir filtre eklenmez, tüm changelog'lar gelir
    };

    const [changelogs, total] = await Promise.all([
      prisma.changelog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          }
        }
      }),
      prisma.changelog.count({ where })
    ]);

    res.json({
      changelogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    res.status(500).json({ error: 'Failed to fetch changelogs' });
  }
});

// GET /api/changelog/latest - Get latest changelogs for sidebar
router.get('/latest', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const changelogs = await prisma.changelog.findMany({
      where: { isPublished: true },
      take: parseInt(limit),
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        version: true,
        publishedAt: true,
        content: true // Include content for preview
      }
    });

    res.json(changelogs);
  } catch (error) {
    console.error('Error fetching latest changelogs:', error);
    res.status(500).json({ error: 'Failed to fetch latest changelogs' });
  }
});

// GET /api/changelog/:id - Get single changelog
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const changelog = await prisma.changelog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    if (!changelog) {
      return res.status(404).json({ error: 'Changelog not found' });
    }

    res.json(changelog);
  } catch (error) {
    console.error('Error fetching changelog:', error);
    res.status(500).json({ error: 'Failed to fetch changelog' });
  }
});

// POST /api/changelog - Create new changelog
router.post('/', async (req, res) => {
  try {
    console.log('Changelog POST request received:', req.body);
    
    const {
      title,
      content,
      version,
      type = 'update',
      isPublished = true,
      authorId,
      releaseDate
    } = req.body;

    console.log('Parsed data:', { title, content, version, type, isPublished, authorId, releaseDate });

    if (!title || !content || !authorId) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ 
        error: 'Title, content, and authorId are required' 
      });
    }

    console.log('Creating changelog with data:', {
      title,
      content,
      version,
      type,
      isPublished,
      authorId,
      publishedAt: isPublished ? new Date() : null,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date()
    });

    const changelog = await prisma.changelog.create({
      data: {
        title,
        content,
        version,
        type,
        isPublished,
        authorId,
        publishedAt: isPublished ? new Date() : null,
        releaseDate: releaseDate ? new Date(releaseDate) : new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    console.log('Changelog created successfully:', changelog.id);
    res.status(201).json(changelog);
  } catch (error) {
    console.error('Error creating changelog - Full error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create changelog', details: error.message });
  }
});

// PUT /api/changelog/:id - Update changelog
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      version,
      type,
      isPublished,
      releaseDate
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (version !== undefined) updateData.version = version;
    if (type !== undefined) updateData.type = type;
    if (releaseDate !== undefined) updateData.releaseDate = new Date(releaseDate);
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      if (isPublished && !updateData.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const changelog = await prisma.changelog.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    res.json(changelog);
  } catch (error) {
    console.error('Error updating changelog:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Changelog not found' });
    }
    res.status(500).json({ error: 'Failed to update changelog' });
  }
});

// DELETE /api/changelog/:id - Delete changelog
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.changelog.delete({
      where: { id }
    });

    res.json({ message: 'Changelog deleted successfully' });
  } catch (error) {
    console.error('Error deleting changelog:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Changelog not found' });
    }
    res.status(500).json({ error: 'Failed to delete changelog' });
  }
});

export default router;
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Admin denetim günlüğü middleware'i
 * Tüm admin işlemlerini kaydeder
 */
export const logAdminAction = (action, targetType) => {
  return async (req, res, next) => {
    // Sadece admin kullanıcılar için log tut
    if (!req.user || req.user.role !== 'admin') {
      return next()
    }

    const originalSend = res.send
    let responseData = null
    let success = true
    let errorMessage = null

    // Response'u yakala
    res.send = function(data) {
      responseData = data
      success = res.statusCode < 400
      if (!success && typeof data === 'string') {
        try {
          const parsed = JSON.parse(data)
          errorMessage = parsed.error || parsed.message
        } catch {
          errorMessage = data
        }
      }
      return originalSend.call(this, data)
    }

    // Response tamamlandığında log kaydet
    res.on('finish', async () => {
      try {
        let targetId = null
        let targetName = null
        let details = {}

        // Request parametrelerinden hedef bilgilerini al
        if (req.params.id) {
          targetId = req.params.id
        }

        // Request body'den ek bilgileri al
        if (req.body) {
          if (req.body.name) targetName = req.body.name
          if (req.body.title) targetName = req.body.title
          if (req.body.username) targetName = req.body.username
          
          // Hassas bilgileri filtrele
          const { password, ...safeBody } = req.body
          details.requestBody = safeBody
        }

        // Query parametrelerini ekle
        if (Object.keys(req.query).length > 0) {
          details.queryParams = req.query
        }

        // HTTP method'u ekle
        details.method = req.method
        details.endpoint = req.originalUrl
        details.statusCode = res.statusCode

        // Response data'sından hedef bilgilerini çıkar
        if (responseData && success) {
          try {
            const parsed = typeof responseData === 'string' ? JSON.parse(responseData) : responseData
            if (parsed.data) {
              if (parsed.data.id && !targetId) targetId = parsed.data.id
              if (parsed.data.name && !targetName) targetName = parsed.data.name
              if (parsed.data.title && !targetName) targetName = parsed.data.title
              if (parsed.data.username && !targetName) targetName = parsed.data.username
            }
          } catch (e) {
            // JSON parse hatası, devam et
          }
        }

        // Admin audit log kaydet
        await prisma.adminAuditLog.create({
          data: {
            action,
            targetType,
            targetId,
            targetName,
            details,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            success,
            errorMessage,
            adminId: req.user.id
          }
        })

      } catch (error) {
        console.error('Admin audit log kaydedilemedi:', error)
        // Audit log hatası ana işlemi etkilemez
      }
    })

    next()
  }
}

/**
 * Özel admin işlemleri için manuel log fonksiyonu
 */
export const logCustomAdminAction = async (adminId, action, targetType, details = {}) => {
  try {
    await prisma.adminAuditLog.create({
      data: {
        action,
        targetType,
        targetId: details.targetId || null,
        targetName: details.targetName || null,
        details: details.additionalInfo || {},
        ipAddress: details.ipAddress || null,
        userAgent: details.userAgent || null,
        success: details.success !== false,
        errorMessage: details.errorMessage || null,
        adminId
      }
    })
  } catch (error) {
    console.error('Custom admin audit log kaydedilemedi:', error)
  }
}

/**
 * Admin audit loglarını getir
 */
export const getAdminAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true
            }
          }
        }
      }),
      prisma.adminAuditLog.count()
    ])

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    next(error)
  }
}
import express from 'express';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '../lib/encryption.js';

const router = express.Router();
const prisma = new PrismaClient();

// IGDB API proxy endpoint
router.post('/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const { body: queryBody } = req.body;

    // Get IGDB credentials from database
    const [clientIdRecord, accessTokenRecord] = await Promise.all([
      prisma.apiKey.findFirst({ 
        where: { serviceName: 'igdb_client_id' },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.apiKey.findFirst({ 
        where: { serviceName: 'igdb_access_token' },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!clientIdRecord || !accessTokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'IGDB API credentials not configured'
      });
    }

    // Decrypt credentials
    const clientId = decrypt(clientIdRecord.keyValue);
    const accessToken = decrypt(accessTokenRecord.keyValue);

    if (!clientId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Failed to decrypt IGDB API credentials'
      });
    }

    // Make request to IGDB API
    const igdbResponse = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: queryBody || req.body
    });

    if (!igdbResponse.ok) {
      const errorText = await igdbResponse.text();
      console.error(`IGDB API Error: ${igdbResponse.status} ${igdbResponse.statusText}`, errorText);
      return res.status(igdbResponse.status).json({
        success: false,
        message: `IGDB API Error: ${igdbResponse.status} ${igdbResponse.statusText}`,
        details: errorText
      });
    }

    const data = await igdbResponse.json();
    res.json(data);

  } catch (error) {
    console.error('IGDB proxy error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test connection endpoint
router.get('/test', async (req, res) => {
  try {
    // Get IGDB credentials from database
    const [clientIdRecord, accessTokenRecord] = await Promise.all([
      prisma.apiKey.findFirst({ 
        where: { serviceName: 'igdb_client_id' },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.apiKey.findFirst({ 
        where: { serviceName: 'igdb_access_token' },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!clientIdRecord || !accessTokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'IGDB API credentials not configured'
      });
    }

    // Decrypt credentials
    const clientId = decrypt(clientIdRecord.keyValue);
    const accessToken = decrypt(accessTokenRecord.keyValue);

    if (!clientId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Failed to decrypt IGDB API credentials'
      });
    }

    // Test with a simple games query
    const testResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: 'fields name; limit 1;'
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      return res.status(testResponse.status).json({
        success: false,
        message: `IGDB API test failed: ${testResponse.status} ${testResponse.statusText}`,
        details: errorText
      });
    }

    const testData = await testResponse.json();
    
    res.json({
      success: true,
      message: 'IGDB API connection successful',
      testData: testData.slice(0, 1) // Only return first result for testing
    });

  } catch (error) {
    console.error('IGDB test error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
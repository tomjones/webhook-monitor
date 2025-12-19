const express = require('express');
const { insertWebhook } = require('../db');

const router = express.Router();

// Catch all webhooks at /webhook/*
router.all('/*', async (req, res) => {
  try {
    // Extract the path after /webhook/
    const webhookPath = req.params[0] || 'default';

    // Get client IP (handle proxies like Heroku)
    const sourceIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     req.socket?.remoteAddress ||
                     'unknown';

    // Store the webhook
    const webhook = await insertWebhook({
      path: webhookPath,
      method: req.method,
      headers: req.headers,
      body: req.body,
      queryParams: req.query,
      sourceIp
    });

    console.log(`Webhook received: ${req.method} /webhook/${webhookPath}`);

    res.status(200).json({
      success: true,
      message: 'Webhook received',
      id: webhook.id,
      path: webhookPath,
      timestamp: webhook.created_at
    });
  } catch (error) {
    console.error('Error storing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store webhook'
    });
  }
});

module.exports = router;

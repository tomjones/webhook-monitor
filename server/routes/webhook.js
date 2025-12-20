const express = require('express');
const { insertWebhook } = require('../db');
const { extractWebhookType } = require('../utils/extractWebhookType');

const router = express.Router();

// Catch all webhooks at /webhook/*
router.all('/*', async (req, res) => {
  try {
    // Extract the path after /webhook/
    const webhookPath = req.params[0] || 'default';

    // Extract webhook type from body or headers
    const webhookType = extractWebhookType(req.body, req.headers);

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
      sourceIp,
      webhookType
    });

    console.log(`Webhook received: ${req.method} /webhook/${webhookPath} [${webhookType}]`);

    res.status(200).json({
      success: true,
      message: 'Webhook received',
      id: webhook.id,
      path: webhookPath,
      type: webhookType,
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

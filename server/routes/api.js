const express = require('express');
const { getWebhooks, getWebhookCount, getWebhookById, deleteWebhook } = require('../db');

const router = express.Router();

// List webhooks with pagination and filtering
router.get('/webhooks', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;
    const path = req.query.path || null;

    const [webhooks, total] = await Promise.all([
      getWebhooks({ limit, offset, path }),
      getWebhookCount(path)
    ]);

    res.json({
      webhooks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// Get single webhook by ID
router.get('/webhooks/:id', async (req, res) => {
  try {
    const webhook = await getWebhookById(req.params.id);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json(webhook);
  } catch (error) {
    console.error('Error fetching webhook:', error);
    res.status(500).json({ error: 'Failed to fetch webhook' });
  }
});

// Delete a webhook
router.delete('/webhooks/:id', async (req, res) => {
  try {
    const deleted = await deleteWebhook(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json({ success: true, message: 'Webhook deleted' });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

module.exports = router;

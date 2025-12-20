const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id SERIAL PRIMARY KEY,
        path VARCHAR(500) NOT NULL,
        method VARCHAR(10) NOT NULL,
        headers JSONB,
        body JSONB,
        query_params JSONB,
        source_ip VARCHAR(45),
        webhook_type VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_webhooks_created_at ON webhooks(created_at DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_webhooks_path ON webhooks(path)
    `);

    // Add webhook_type column if it doesn't exist (for existing databases)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'webhooks' AND column_name = 'webhook_type'
        ) THEN
          ALTER TABLE webhooks ADD COLUMN webhook_type VARCHAR(255);
        END IF;
      END $$;
    `);

    // Create webhook_type index (after ensuring column exists)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_webhooks_type ON webhooks(webhook_type)
    `);

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

async function insertWebhook({ path, method, headers, body, queryParams, sourceIp, webhookType }) {
  const result = await pool.query(
    `INSERT INTO webhooks (path, method, headers, body, query_params, source_ip, webhook_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [path, method, JSON.stringify(headers), JSON.stringify(body), JSON.stringify(queryParams), sourceIp, webhookType]
  );
  return result.rows[0];
}

async function getWebhooks({ limit = 50, offset = 0, path = null, webhookType = null }) {
  let query = 'SELECT * FROM webhooks WHERE 1=1';
  const params = [];
  let paramCount = 0;

  if (path) {
    params.push(`%${path}%`);
    query += ` AND path LIKE $${++paramCount}`;
  }

  if (webhookType) {
    params.push(webhookType);
    query += ` AND webhook_type = $${++paramCount}`;
  }

  query += ' ORDER BY created_at DESC';
  query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
}

async function getWebhookCount(path = null, webhookType = null) {
  let query = 'SELECT COUNT(*) FROM webhooks WHERE 1=1';
  const params = [];
  let paramCount = 0;

  if (path) {
    params.push(`%${path}%`);
    query += ` AND path LIKE $${++paramCount}`;
  }

  if (webhookType) {
    params.push(webhookType);
    query += ` AND webhook_type = $${++paramCount}`;
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count, 10);
}

async function getWebhookById(id) {
  const result = await pool.query('SELECT * FROM webhooks WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function deleteWebhook(id) {
  const result = await pool.query('DELETE FROM webhooks WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
}

async function deleteOldWebhooks(days = 90) {
  const result = await pool.query(
    `DELETE FROM webhooks WHERE created_at < NOW() - INTERVAL '${days} days' RETURNING id`
  );
  return result.rowCount;
}

async function getUniqueWebhookTypes() {
  const result = await pool.query(
    'SELECT DISTINCT webhook_type FROM webhooks WHERE webhook_type IS NOT NULL ORDER BY webhook_type'
  );
  return result.rows.map(row => row.webhook_type);
}

module.exports = {
  pool,
  initializeDatabase,
  insertWebhook,
  getWebhooks,
  getWebhookCount,
  getWebhookById,
  deleteWebhook,
  deleteOldWebhooks,
  getUniqueWebhookTypes
};

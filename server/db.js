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
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_webhooks_created_at ON webhooks(created_at DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_webhooks_path ON webhooks(path)
    `);

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

async function insertWebhook({ path, method, headers, body, queryParams, sourceIp }) {
  const result = await pool.query(
    `INSERT INTO webhooks (path, method, headers, body, query_params, source_ip)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [path, method, JSON.stringify(headers), JSON.stringify(body), JSON.stringify(queryParams), sourceIp]
  );
  return result.rows[0];
}

async function getWebhooks({ limit = 50, offset = 0, path = null }) {
  let query = 'SELECT * FROM webhooks';
  const params = [];

  if (path) {
    query += ' WHERE path LIKE $1';
    params.push(`%${path}%`);
  }

  query += ' ORDER BY created_at DESC';
  query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
}

async function getWebhookCount(path = null) {
  let query = 'SELECT COUNT(*) FROM webhooks';
  const params = [];

  if (path) {
    query += ' WHERE path LIKE $1';
    params.push(`%${path}%`);
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

module.exports = {
  pool,
  initializeDatabase,
  insertWebhook,
  getWebhooks,
  getWebhookCount,
  getWebhookById,
  deleteWebhook,
  deleteOldWebhooks
};

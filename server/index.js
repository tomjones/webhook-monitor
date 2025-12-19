const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db');
const { startCleanupJob } = require('./cleanup');
const webhookRoutes = require('./routes/webhook');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: 'text/*' }));
app.use(express.raw({ type: 'application/octet-stream' }));

// Routes
app.use('/webhook', webhookRoutes);
app.use('/api', apiRoutes);

// Serve React app in production
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Catch-all route for React SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start server
async function start() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start cleanup job
    startCleanupJob();

    app.listen(PORT, () => {
      console.log(`Webhook Monitor running on port ${PORT}`);
      console.log(`- Dashboard: http://localhost:${PORT}`);
      console.log(`- Webhook endpoint: http://localhost:${PORT}/webhook/<your-path>`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

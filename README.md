# Webhook Monitor

A simple app that catches webhooks from any source and displays them in a web dashboard.

## Quick Start

```bash
# Set your database URL
export DATABASE_URL=postgres://user:pass@localhost:5432/webhooks

# Install and run
npm install
npm start
```

Open http://localhost:3000 to view the dashboard.

## Sending Webhooks

Send webhooks to any path under `/webhook/`:

```bash
curl -X POST http://localhost:3000/webhook/stripe/payments \
  -H "Content-Type: application/json" \
  -d '{"event": "payment.success"}'
```

The path can be anything you want (e.g., `/webhook/paypal`, `/webhook/github/push`).

## Deploy to Heroku

```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:essential-0
git push heroku main
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `PORT` | Server port | 3000 |
| `RETENTION_DAYS` | Days to keep webhooks | 90 |

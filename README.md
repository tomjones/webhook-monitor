# Webhook Monitor

A simple app that catches webhooks from any source and displays them in a web dashboard. Automatically extracts and categorizes webhook types from popular providers like Stripe, GitHub, Shopify, and more.

## Features

- **Universal Webhook Capture**: Accept webhooks from any source at any path
- **Automatic Type Extraction**: Intelligently detects webhook types from body fields and headers
- **Multi-Provider Support**: Works with Stripe, GitHub, Shopify, and generic webhooks
- **Filtering & Search**: Filter webhooks by client, service, and event type
- **Real-time Dashboard**: View all captured webhooks in an intuitive web interface
- **Automatic Cleanup**: Configurable retention period for webhook data

## Quick Start

```bash
# Set your database URL
export DATABASE_URL=postgres://user:pass@localhost:5432/webhooks

# Install and run
npm install
npm start
```

Open http://localhost:3000 to view the dashboard.

## Building the Client

To rebuild the React client (required after modifying client code or Tailwind styles):

```bash
npm run build
```

This command installs client dependencies and builds the production-ready client bundle.

## Sending Webhooks

### Basic Usage

Send webhooks to any path under `/webhook/`:

```bash
curl -X POST http://localhost:3000/webhook/stripe/payments \
  -H "Content-Type: application/json" \
  -d '{"event": "payment.success"}'
```

The path can be anything you want (e.g., `/webhook/paypal`, `/webhook/github/push`).

### Multi-Client Path Structure

Organize webhooks by client, service, and event type:

```
/webhook/{client_id}/{service}/{event_type}
```

**Example:**
```bash
curl -X POST http://localhost:3000/webhook/acme-corp/stripe/payments \
  -H "Content-Type: application/json" \
  -d '{"type": "payment_intent.succeeded", "data": {}}'
```

This webhook will be categorized as:
- **Client ID**: `acme-corp`
- **Service**: `stripe`
- **Event Type**: `payments`
- **Webhook Type**: `payment_intent.succeeded` (auto-extracted from `body.type`)

### Webhook Type Extraction

The system automatically extracts webhook types from common locations:

#### Supported Body Fields (priority order)
1. `body.type` - Used by Stripe
2. `body.event` - Common in generic webhooks
3. `body.event_type` - Alternative event field
4. `body.action` - Used for action-based events
5. `body.kind` - Alternative type field

#### Supported Headers
1. `X-GitHub-Event` - GitHub webhooks
2. `X-Shopify-Topic` - Shopify webhooks
3. `X-Event-Type` - Generic event type header
4. `X-Event-Name` - Alternative event header

If no type is found, the webhook is marked as `unknown`.

### Provider-Specific Examples

#### Stripe Webhook
```bash
curl -X POST http://localhost:3000/webhook/client1/stripe/payment \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_123",
        "amount": 1000
      }
    }
  }'
```
**Extracted Type**: `payment_intent.succeeded`

#### GitHub Webhook
```bash
curl -X POST http://localhost:3000/webhook/client1/github/push \
  -H "X-GitHub-Event: push" \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "refs/heads/main",
    "commits": []
  }'
```
**Extracted Type**: `push`

#### Shopify Webhook
```bash
curl -X POST http://localhost:3000/webhook/client1/shopify/orders \
  -H "X-Shopify-Topic: orders/create" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 12345,
    "line_items": []
  }'
```
**Extracted Type**: `orders/create`

#### Generic Webhook
```bash
curl -X POST http://localhost:3000/webhook/client1/custom/users \
  -H "Content-Type: application/json" \
  -d '{
    "event": "user.created",
    "data": {
      "user_id": "u_123"
    }
  }'
```
**Extracted Type**: `user.created`

## Dashboard Features

The web dashboard at `http://localhost:3000` provides:

### Webhook Table View
- **ID**: Unique webhook identifier
- **Client**: Client ID from the webhook path
- **Service**: Service name (e.g., stripe, github, shopify)
- **Type**: Automatically extracted webhook type (with visual badge)
- **Method**: HTTP method (GET, POST, PUT, etc.)
- **Path**: Full webhook path
- **Timestamp**: When the webhook was received

### Filtering Options
- **Client ID**: Filter by specific client
- **Service**: Filter by service provider
- **Webhook Type**: Filter by specific event type (dropdown populated with all unique types)
- **Path**: Search by partial path match
- **Method**: Filter by HTTP method

### Webhook Details
Click on any webhook to view:
- Complete headers
- Request body (formatted JSON)
- Query parameters
- Source IP address
- Full metadata

## API Endpoints

### Get Webhooks
```bash
GET /api/webhooks?limit=50&offset=0&client_id=acme-corp&service=stripe&webhook_type=payment_intent.succeeded
```

**Query Parameters:**
- `limit` - Number of webhooks to return (default: 50)
- `offset` - Pagination offset (default: 0)
- `path` - Filter by partial path match
- `client_id` - Filter by client ID
- `service` - Filter by service name
- `webhook_type` - Filter by webhook type

**Response:**
```json
{
  "webhooks": [...],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### Get Unique Webhook Types
```bash
GET /api/webhook-types?client_id=acme-corp&service=stripe
```

**Query Parameters:**
- `client_id` - Optional: filter types by client
- `service` - Optional: filter types by service

**Response:**
```json
[
  "payment_intent.succeeded",
  "charge.refunded",
  "customer.created",
  "invoice.paid"
]
```

### Get Webhook by ID
```bash
GET /api/webhooks/:id
```

**Response:**
```json
{
  "id": 123,
  "path": "acme-corp/stripe/payments",
  "client_id": "acme-corp",
  "service": "stripe",
  "event_type": "payments",
  "webhook_type": "payment_intent.succeeded",
  "method": "POST",
  "headers": {...},
  "body": {...},
  "query_params": {...},
  "source_ip": "192.168.1.1",
  "created_at": "2025-12-27T02:00:00.000Z"
}
```

### Delete Webhook
```bash
DELETE /api/webhooks/:id
```

## Database Schema

The `webhooks` table includes:

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `path` | VARCHAR(500) | Full webhook path |
| `client_id` | VARCHAR(255) | Extracted client identifier |
| `service` | VARCHAR(255) | Service name (stripe, github, etc.) |
| `event_type` | VARCHAR(255) | Event category from path |
| `webhook_type` | VARCHAR(255) | **Auto-extracted event type** |
| `method` | VARCHAR(10) | HTTP method |
| `headers` | JSONB | Request headers |
| `body` | JSONB | Request body |
| `query_params` | JSONB | URL query parameters |
| `source_ip` | VARCHAR(45) | Client IP address |
| `created_at` | TIMESTAMP | Webhook receipt time |

**Indexes:**
- `idx_webhooks_created_at` - Timestamp (DESC)
- `idx_webhooks_path` - Path matching
- `idx_webhooks_client_id` - Client filtering
- `idx_webhooks_service` - Service filtering
- `idx_webhooks_type` - Type filtering
- `idx_webhooks_service_type` - Combined service + type queries

## Use Cases

### Airflow DAG Integration

Query specific webhook types for processing:

```python
# Process all Stripe payment_intent.succeeded webhooks
webhooks = query("""
  SELECT * FROM webhooks
  WHERE client_id = 'acme-corp'
    AND service = 'stripe'
    AND webhook_type = 'payment_intent.succeeded'
    AND status = 'pending'
  ORDER BY created_at ASC
""")

for webhook in webhooks:
    process_payment(webhook.body)
```

### Real-time Monitoring

Monitor specific event types:

```bash
# Watch for GitHub push events
watch -n 5 'curl -s "http://localhost:3000/api/webhooks?service=github&webhook_type=push&limit=10"'
```

### Debugging Webhook Issues

Quickly find failed webhooks of a specific type:

```bash
# Find all charge.refunded events from the last hour
curl "http://localhost:3000/api/webhooks?webhook_type=charge.refunded&limit=100"
```

## Common Webhook Types

### Stripe
- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Charge was refunded
- `customer.created` - New customer created
- `customer.updated` - Customer information updated
- `invoice.paid` - Invoice was paid
- `invoice.payment_failed` - Invoice payment failed

### GitHub
- `push` - Code pushed to repository
- `pull_request` - Pull request opened/updated/closed
- `issues` - Issue opened/edited/closed
- `release` - Release published
- `workflow_run` - GitHub Actions workflow completed
- `pull_request_review` - PR review submitted

### Shopify
- `orders/create` - New order created
- `orders/updated` - Order updated
- `orders/cancelled` - Order cancelled
- `products/create` - New product added
- `products/update` - Product updated
- `customers/create` - New customer
- `customers/delete` - Customer deleted

### Generic/Custom
- `user.created` - User registration
- `user.updated` - User profile updated
- `order.completed` - Order fulfilled
- `payment.failed` - Payment processing error
- `subscription.cancelled` - Subscription ended

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

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
# Build the client bundle
npm run build

# Start production server
NODE_ENV=production npm start
```

### Database Migrations

The database schema automatically initializes on first run. The `webhook_type` column and indexes are created automatically if they don't exist.

## Troubleshooting

### Webhook Type Shows as "unknown"

If webhooks aren't being typed correctly:

1. **Check body structure**: Ensure your webhook includes one of the supported fields (`type`, `event`, `event_type`, `action`, `kind`)
2. **Check headers**: Verify headers like `X-GitHub-Event` are being sent
3. **View raw webhook**: Click on the webhook in the dashboard to see the raw body and headers
4. **Add custom header**: Send `X-Event-Type` header with your webhook type

### Filtering Not Working

1. Ensure the database indexes are created (check logs on startup)
2. Clear browser cache and reload the dashboard
3. Check that webhook_type column exists in database:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'webhooks' AND column_name = 'webhook_type';
   ```

## License

MIT

# API Documentation

## Overview
The LinkShort API provides RESTful endpoints for URL shortening, management, and analytics. All endpoints use JSON for request/response bodies and follow standard HTTP status codes.

## Base URL
\`\`\`
Production: https://your-domain.vercel.app/api
Development: http://localhost:3000/api
\`\`\`

## Authentication
Most endpoints require authentication using JWT tokens provided by Supabase Auth.

### Authentication Header
\`\`\`http
Authorization: Bearer <jwt_token>
\`\`\`

### Getting Authentication Token
Use the Supabase client library to authenticate and obtain tokens:
\`\`\`javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
// Token available in data.session.access_token
\`\`\`

## Endpoints

### URL Shortening

#### Create Short URL
Create a new shortened URL.

\`\`\`http
POST /api/shorten
\`\`\`

**Request Body:**
\`\`\`json
{
  "original_url": "https://example.com/very/long/url",
  "title": "Optional title",
  "description": "Optional description"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "short_code": "abc123",
  "original_url": "https://example.com/very/long/url",
  "short_url": "https://your-domain.vercel.app/abc123",
  "created_at": "2024-01-15T10:30:00Z"
}
\`\`\`

**Error Responses:**
- `400 Bad Request`: Invalid URL format
- `401 Unauthorized`: Authentication required (for user-owned URLs)
- `500 Internal Server Error`: Server error

### URL Management

#### Get User URLs
Retrieve all URLs created by the authenticated user.

\`\`\`http
GET /api/urls
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "urls": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "short_code": "abc123",
      "original_url": "https://example.com/very/long/url",
      "short_url": "https://your-domain.vercel.app/abc123",
      "title": "Example Page",
      "description": "A sample page",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "expires_at": null,
      "is_active": true,
      "click_count": 42
    }
  ]
}
\`\`\`

#### Update URL
Update URL metadata (title, description, active status).

\`\`\`http
PATCH /api/urls/{id}
\`\`\`

**Request Body:**
\`\`\`json
{
  "title": "Updated title",
  "description": "Updated description",
  "is_active": false
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "short_code": "abc123",
  "original_url": "https://example.com/very/long/url",
  "short_url": "https://your-domain.vercel.app/abc123",
  "title": "Updated title",
  "description": "Updated description",
  "is_active": false,
  "updated_at": "2024-01-15T11:00:00Z"
}
\`\`\`

#### Delete URL
Delete a URL and all associated analytics data.

\`\`\`http
DELETE /api/urls/{id}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "message": "URL deleted successfully"
}
\`\`\`

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `404 Not Found`: URL not found or access denied
- `500 Internal Server Error`: Server error

### Analytics

#### Get URL Analytics
Retrieve detailed analytics for a specific URL.

\`\`\`http
GET /api/analytics/{id}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "url": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "short_code": "abc123",
    "original_url": "https://example.com/very/long/url",
    "title": "Example Page"
  },
  "total_clicks": 156,
  "unique_ips": 89,
  "clicks_today": 12,
  "clicks_this_week": 45,
  "clicks_this_month": 156,
  "top_countries": [
    { "country": "US", "count": 67 },
    { "country": "UK", "count": 23 },
    { "country": "CA", "count": 18 }
  ],
  "top_browsers": [
    { "browser": "Chrome", "count": 89 },
    { "browser": "Firefox", "count": 34 },
    { "browser": "Safari", "count": 23 }
  ],
  "daily_clicks": [
    { "date": "2024-01-01", "clicks": 5 },
    { "date": "2024-01-02", "clicks": 8 },
    { "date": "2024-01-03", "clicks": 12 }
  ],
  "recent_clicks": [
    {
      "clicked_at": "2024-01-15T14:30:00Z",
      "country": "US",
      "city": "New York",
      "browser": "Chrome",
      "device_type": "Desktop",
      "referer": "https://google.com"
    }
  ]
}
\`\`\`

### URL Resolution

#### Redirect to Original URL
Resolve a short code and redirect to the original URL while tracking analytics.

\`\`\`http
GET /{shortCode}
\`\`\`

**Response (302 Found):**
\`\`\`http
Location: https://example.com/very/long/url
\`\`\`

**Error Responses:**
- `404 Not Found`: Short code not found
- `410 Gone`: URL has expired
- `500 Internal Server Error`: Server error

## Error Handling

### Standard Error Response Format
\`\`\`json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
\`\`\`

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `410 Gone`: Resource expired or deleted
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

### Current Limits
- **Anonymous users**: 10 requests per minute
- **Authenticated users**: 100 requests per minute
- **URL creation**: 50 URLs per hour per user

### Rate Limit Headers
\`\`\`http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
\`\`\`

## SDK Examples

### JavaScript/TypeScript
\`\`\`javascript
// Create short URL
const response = await fetch('/api/shorten', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    original_url: 'https://example.com/long-url'
  })
});

const data = await response.json();
console.log(data.short_url);
\`\`\`

### cURL
\`\`\`bash
# Create short URL
curl -X POST https://your-domain.vercel.app/api/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"original_url": "https://example.com/long-url"}'

# Get analytics
curl -X GET https://your-domain.vercel.app/api/analytics/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

### Python
\`\`\`python
import requests

# Create short URL
response = requests.post(
    'https://your-domain.vercel.app/api/shorten',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    },
    json={
        'original_url': 'https://example.com/long-url'
    }
)

data = response.json()
print(data['short_url'])
\`\`\`

## Webhooks (Future Feature)

### Webhook Events
- `url.created`: New URL created
- `url.clicked`: URL accessed
- `url.updated`: URL metadata updated
- `url.deleted`: URL deleted

### Webhook Payload Example
\`\`\`json
{
  "event": "url.clicked",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "url_id": "550e8400-e29b-41d4-a716-446655440000",
    "short_code": "abc123",
    "click_data": {
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "referer": "https://google.com",
      "country": "US",
      "city": "New York"
    }
  }
}
\`\`\`

## API Versioning

### Current Version
All endpoints are currently version 1 (v1). Future versions will be accessible via:
\`\`\`
/api/v2/shorten
/api/v2/urls
\`\`\`

### Deprecation Policy
- 6 months notice for breaking changes
- Backward compatibility maintained for 1 year
- Clear migration guides provided

## Testing

### Test Environment
\`\`\`
Base URL: https://your-domain-staging.vercel.app/api
\`\`\`

### Test Data
Use the following test URLs for development:
- `https://httpbin.org/get` - Returns request data
- `https://httpbin.org/delay/2` - 2-second delay response
- `https://httpbin.org/status/404` - Returns 404 status

### Postman Collection
A Postman collection is available for testing all endpoints:
[Download Collection](./postman/LinkShort_API.postman_collection.json)

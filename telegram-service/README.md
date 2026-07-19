# Telegram Channel Fetcher Service

A standalone Python/Flask microservice that fetches posts from public Telegram channels using Telethon (MTProto protocol).

## Setup

### 1. Install dependencies
```bash
cd telegram-service
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env` and set:
- `TELEGRAM_API_ID` — from [my.telegram.org](https://my.telegram.org)
- `TELEGRAM_API_HASH` — from [my.telegram.org](https://my.telegram.org)
- `SESSION_STRING` — generated in step 3

### 3. Generate Session String
```bash
python generate_session.py
```
This will ask for your phone number and a verification code. Copy the output string into `.env`.

### 4. Run the service
```bash
python app.py
```
The service runs on `http://localhost:5001` by default.

## API

### `POST /fetch-channel`
Fetch all posts with photos from a public Telegram channel.

**Request:**
```json
{ "channel": "@channel_username" }
```

**Response:**
```json
{
  "success": true,
  "channel": "@channel_username",
  "total": 150,
  "messages": [
    {
      "message_id": 123,
      "caption": "Product description text...",
      "image_base64": "base64_encoded_image_data...",
      "date": "2026-07-19T12:00:00+00:00"
    }
  ]
}
```

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| `CHANNEL_NOT_FOUND` | 404 | Channel username doesn't exist |
| `CHANNEL_PRIVATE` | 403 | Channel is private |
| `FLOOD_WAIT` | 429 | Telegram rate limit (includes `retryAfter` seconds) |
| `INVALID_USERNAME` | 400 | Bad username format |
| `AUTH_ERROR` | 401 | Session string invalid or expired |

### `GET /health`
Health check endpoint.

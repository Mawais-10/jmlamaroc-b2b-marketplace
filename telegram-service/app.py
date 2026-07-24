import os
import sys

# Force UTF-8 and disable tqdm / HuggingFace progress bars to prevent Windows charmap encoding errors
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["TQDM_DISABLE"] = "1"
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "1"

import transformers
transformers.logging.set_verbosity_error()

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import io
import base64
import asyncio
import json
from datetime import datetime

# CLIP lazy imports (loaded on first request to keep startup fast)
import requests as http_requests
from PIL import Image as PILImage

from dotenv import load_dotenv
from flask_cors import CORS
from flask import Flask, request, jsonify
from telethon import TelegramClient, errors
from telethon.sessions import StringSession
from telethon.tl.types import MessageMediaPhoto
from telethon.tl.functions.channels import GetFullChannelRequest

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5000", "https://jmlamaroc.com"]}})

# ─── Config ───────────────────────────────────────────────────────────────────
API_ID = int(os.getenv('TELEGRAM_API_ID', '0'))
API_HASH = os.getenv('TELEGRAM_API_HASH', '')
SESSION_STRING = os.getenv('SESSION_STRING', '')
PORT = int(os.getenv('PORT', '5002'))

if not API_ID or not API_HASH or not SESSION_STRING:
    print("WARNING: TELEGRAM_API_ID, TELEGRAM_API_HASH, or SESSION_STRING not set in .env")


import threading

telegram_loop = None
telegram_client = None

def start_telegram_loop():
    global telegram_loop, telegram_client
    telegram_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(telegram_loop)
    
    # Initialize and connect the Telegram Client ONCE
    telegram_client = TelegramClient(StringSession(SESSION_STRING), API_ID, API_HASH)
    telegram_loop.run_until_complete(telegram_client.connect())
    print("\n[TELEGRAM] Persistent Telegram Client connected successfully!\n")
    
    telegram_loop.run_forever()

if API_ID and API_HASH and SESSION_STRING:
    t = threading.Thread(target=start_telegram_loop, daemon=True)
    t.start()
else:
    print("WARNING: TELEGRAM_API_ID, TELEGRAM_API_HASH, or SESSION_STRING not set in .env")


async def fetch_channel_messages(channel_username):
    """
    Fetch all messages with photos from a Telegram channel.
    Returns batched results (100 per batch) with base64 images.
    """
    if not await telegram_client.is_user_authorized():
        return {'error': 'Session not authorized. Please regenerate SESSION_STRING.', 'code': 'AUTH_ERROR'}, 401

    try:
        # Resolve the channel entity
        try:
            entity = await telegram_client.get_entity(channel_username)
        except ValueError:
            return {'error': f'Channel "{channel_username}" not found.', 'code': 'CHANNEL_NOT_FOUND'}, 404
        except errors.ChannelPrivateError:
            return {
                'error': 'This channel is private. Make it public or add our bot as admin.',
                'code': 'CHANNEL_PRIVATE'
            }, 403
        except errors.UsernameNotOccupiedError:
            return {'error': f'Channel "{channel_username}" does not exist.', 'code': 'CHANNEL_NOT_FOUND'}, 404
        except errors.UsernameInvalidError:
            return {'error': f'Invalid channel username: "{channel_username}".', 'code': 'INVALID_USERNAME'}, 400

        # Fetch full channel details (title, about, subscribers, avatar)
        channel_info = {
            'title': getattr(entity, 'title', ''),
            'about': '',
            'subscribers': 0,
            'avatar_base64': None,
        }
        try:
            full_channel = await telegram_client(GetFullChannelRequest(entity))
            channel_info['about'] = full_channel.full_chat.about or ''
            channel_info['subscribers'] = full_channel.full_chat.participants_count or 0
        except Exception as e:
            print(f"Could not fetch full channel details: {e}")

        # Download channel avatar
        try:
            avatar_bytes = await telegram_client.download_profile_photo(entity, file=bytes)
            if avatar_bytes:
                channel_info['avatar_base64'] = base64.b64encode(avatar_bytes).decode('utf-8')
        except Exception as e:
            print(f"Could not download channel avatar: {e}")

        all_messages = []

        # Iterate through all messages in the channel
        async for message in telegram_client.iter_messages(entity, limit=None):
            # Only process messages that have both a photo and a caption
            if not message.photo or not message.text:
                continue

            all_messages.append({
                'message_id': message.id,
                'caption': message.text,
                'date': message.date.isoformat() if message.date else None,
            })

        print(f"Total messages with photos: {len(all_messages)}")

        return {
            'success': True,
            'channel': channel_username,
            'total': len(all_messages),
            'messages': all_messages,
            'channel_info': channel_info,
        }, 200

    except errors.FloodWaitError as e:
        wait_time = e.seconds
        return {
            'error': f'Telegram rate limit hit. Please retry after {wait_time} seconds.',
            'code': 'FLOOD_WAIT',
            'retryAfter': wait_time,
        }, 429
    except errors.ChannelPrivateError:
        return {
            'error': 'This channel is private. Make it public or add our bot as admin.',
            'code': 'CHANNEL_PRIVATE'
        }, 403
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {'error': str(e), 'code': 'INTERNAL_ERROR'}, 500


@app.route('/fetch-channel', methods=['POST'])
def fetch_channel():
    """
    POST /fetch-channel
    Body: { "channel": "@username" }
    Returns: { success, channel, total, messages: [{ message_id, caption, image_base64, date }] }
    """
    if not telegram_loop or not telegram_client:
        return jsonify({'error': 'Telegram client not initialized.', 'code': 'INIT_ERROR'}), 500

    data = request.get_json()
    if not data or not data.get('channel'):
        return jsonify({'error': 'Missing "channel" field.', 'code': 'MISSING_FIELD'}), 400

    channel = data['channel'].strip()

    # Normalize: ensure it starts with @
    if not channel.startswith('@'):
        channel = f'@{channel}'

    # Validate format: @username (5-32 alphanumeric + underscores)
    username = channel[1:]  # Remove @
    if not username or len(username) < 4 or len(username) > 32:
        return jsonify({'error': 'Username must be 5-32 characters.', 'code': 'INVALID_USERNAME'}), 400

    import re
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]{3,31}$', username):
        return jsonify({'error': 'Invalid username format.', 'code': 'INVALID_USERNAME'}), 400

    # Run on persistent background loop
    future = asyncio.run_coroutine_threadsafe(fetch_channel_messages(channel), telegram_loop)
    try:
        result, status_code = future.result(timeout=300)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'INTERNAL_ERROR'}), 500


async def fetch_message_photo(channel_username, message_id):
    """
    Download a single message's photo and return it base64-encoded.
    """
    if not await telegram_client.is_user_authorized():
        return {'error': 'Session not authorized. Please regenerate SESSION_STRING.', 'code': 'AUTH_ERROR'}, 401

    try:
        # Resolve entity
        try:
            entity = await telegram_client.get_entity(channel_username)
        except Exception as e:
            return {'error': f'Channel "{channel_username}" not found: {e}', 'code': 'CHANNEL_NOT_FOUND'}, 404

        # Fetch message
        try:
            message = await telegram_client.get_messages(entity, ids=message_id)
        except Exception as e:
            return {'error': f'Message {message_id} not found: {e}', 'code': 'MESSAGE_NOT_FOUND'}, 404

        if not message or not message.photo:
            return {'error': 'Message does not contain a photo.', 'code': 'NO_PHOTO'}, 400

        # Download photo
        try:
            photo_bytes = await telegram_client.download_media(message.photo, file=bytes)
        except errors.FloodWaitError as e:
            wait_time = min(e.seconds, 60)
            print(f"Flood wait: sleeping {wait_time}s...")
            await asyncio.sleep(wait_time)
            photo_bytes = await telegram_client.download_media(message.photo, file=bytes)

        if not photo_bytes:
            return {'error': 'Failed to download photo.', 'code': 'DOWNLOAD_FAILED'}, 500

        # Encode to base64
        image_b64 = base64.b64encode(photo_bytes).decode('utf-8')

        return {
            'success': True,
            'message_id': message_id,
            'image_base64': image_b64,
        }, 200

    except errors.FloodWaitError as e:
        return {
            'error': f'Telegram rate limit hit. Retry after {e.seconds} seconds.',
            'code': 'FLOOD_WAIT',
            'retryAfter': e.seconds,
        }, 429
    except Exception as e:
        print(f"Unexpected error in fetch_message_photo: {e}")
        return {'error': str(e), 'code': 'INTERNAL_ERROR'}, 500


@app.route('/fetch-photo', methods=['POST'])
def fetch_photo():
    """
    POST /fetch-photo
    Body: { "channel": "@username", "message_id": 123 }
    Returns: { success, message_id, image_base64 }
    """
    if not telegram_loop or not telegram_client:
        return jsonify({'error': 'Telegram client not initialized.', 'code': 'INIT_ERROR'}), 500

    data = request.get_json()
    if not data or not data.get('channel') or not data.get('message_id'):
        return jsonify({'error': 'Missing "channel" or "message_id" field.', 'code': 'MISSING_FIELD'}), 400

    channel = data['channel'].strip()
    message_id = int(data['message_id'])

    # Run on persistent background loop
    future = asyncio.run_coroutine_threadsafe(fetch_message_photo(channel, message_id), telegram_loop)
    try:
        result, status_code = future.result(timeout=60)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({'error': str(e), 'code': 'INTERNAL_ERROR'}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'success': True,
        'service': 'telegram-fetcher',
        'status': 'running',
        'timestamp': datetime.utcnow().isoformat(),
    })


# ─── CLIP Embedding Endpoints ─────────────────────────────────────────────────
# These endpoints are appended to the existing Flask app without changing any
# existing Telegram routes above.

# Lazy CLIP singleton — model loads on first request, not at startup
_clip_model = None
_clip_processor = None

def get_clip_model():
    """Lazy-load CLIP model once, reuse across all requests."""
    global _clip_model, _clip_processor
    if _clip_model is None:
        print("[CLIP] Loading model (openai/clip-vit-base-patch32)...")
        import torch
        from transformers import CLIPModel, CLIPProcessor
        _clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        _clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        _clip_model.eval()
        print("[CLIP] Model loaded successfully.")
    return _clip_model, _clip_processor


def extract_tensor(out):
    """Safely extract 2D embedding tensor [batch, dim] across different transformers library versions."""
    if hasattr(out, 'pooler_output') and out.pooler_output is not None:
        return out.pooler_output
    if hasattr(out, 'text_embeds') and out.text_embeds is not None:
        return out.text_embeds
    if hasattr(out, 'image_embeds') and out.image_embeds is not None:
        return out.image_embeds
    if isinstance(out, (list, tuple)):
        return out[0]
    return out


@app.route('/embed-image', methods=['POST'])
def embed_image():
    """
    POST /embed-image
    Body: { "imageUrl": "https://res.cloudinary.com/..." }
       OR { "imageUrl": "data:image/jpeg;base64,/9j/..." }
    Returns: { "success": true, "embedding": [0.12, -0.34, ...] }  (512-dim CLIP vector)

    Accepts either a Cloudinary CDN URL or a base64 data URI.
    Downloads/decodes the image, generates a normalized 512-dimensional CLIP
    image embedding and returns it as a list.
    """
    import torch
    import base64 as b64_module

    data = request.get_json()
    if not data or not data.get('imageUrl'):
        return jsonify({'success': False, 'error': 'Missing "imageUrl" field.'}), 400

    image_url = data['imageUrl']

    try:
        # Handle base64 data URI (e.g. "data:image/jpeg;base64,/9j/...")
        if image_url.startswith('data:'):
            header, encoded = image_url.split(',', 1)
            img_bytes = b64_module.b64decode(encoded)
            image = PILImage.open(io.BytesIO(img_bytes)).convert("RGB")
        else:
            # Regular HTTP/HTTPS URL (Cloudinary CDN)
            resp = http_requests.get(image_url, timeout=15)
            resp.raise_for_status()
            image = PILImage.open(io.BytesIO(resp.content)).convert("RGB")

        model, processor = get_clip_model()

        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            out = model.get_image_features(**inputs)
            image_features = extract_tensor(out)

        # Ensure 2D tensor [1, 512]
        if image_features.ndim == 1:
            image_features = image_features.unsqueeze(0)

        # L2-normalize so cosine similarity == dot product in Atlas
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        embedding = image_features.cpu().numpy()[0].tolist()

        return jsonify({'success': True, 'embedding': embedding})

    except Exception as e:
        err_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        print(f"embed_image error: {err_msg}")
        return jsonify({'success': False, 'error': err_msg}), 500


@app.route('/embed-text', methods=['POST'])
def embed_text():
    """
    POST /embed-text
    Body: { "text": "red summer dress" }
    Returns: { "success": true, "embedding": [0.12, -0.34, ...] }  (512-dim CLIP vector)

    Generates a normalized 512-dimensional CLIP text embedding from the query
    string. Used by /api/search/text in the Node backend for text-to-image search.
    """
    import torch

    data = request.get_json()
    if not data or not data.get('text'):
        return jsonify({'success': False, 'error': 'Missing "text" field.'}), 400

    text = data['text'].strip()

    try:
        model, processor = get_clip_model()

        inputs = processor(text=[text], return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            out = model.get_text_features(**inputs)
            text_features = extract_tensor(out)

        # Ensure 2D tensor [1, 512]
        if text_features.ndim == 1:
            text_features = text_features.unsqueeze(0)

        # L2-normalize
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        embedding = text_features.cpu().numpy()[0].tolist()

        return jsonify({'success': True, 'embedding': embedding})

    except Exception as e:
        err_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        print(f"embed_text error: {err_msg}")
        return jsonify({'success': False, 'error': err_msg}), 500


if __name__ == '__main__':
    print(f"\nTelegram Fetch Service running on http://localhost:{PORT}")
    print(f"API_ID: {API_ID}")
    print(f"Session: {'Set' if SESSION_STRING else 'Missing'}\n")
    app.run(host='0.0.0.0', port=PORT, debug=False)



"""
Telegram Channel Fetcher Microservice
Flask + Telethon — fetches posts (with photos) from public Telegram channels.
Returns messages in batches of 100 with base64-encoded images.
"""

import os
import io
import base64
import asyncio
import json
from datetime import datetime

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
    print("\n⚡ Persistent Telegram Client connected successfully! ⚡\n")
    
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


if __name__ == '__main__':
    print(f"\nTelegram Fetch Service running on http://localhost:{PORT}")
    print(f"API_ID: {API_ID}")
    print(f"Session: {'Set' if SESSION_STRING else 'Missing'}\n")
    app.run(host='0.0.0.0', port=PORT, debug=False)



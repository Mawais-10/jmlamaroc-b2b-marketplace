"""
Generate a Telethon StringSession for the Telegram Fetch Service.

Run this script once:
    python generate_session.py

It will ask for your phone number and a verification code.
Copy the output session string into your .env file as SESSION_STRING.
"""

import asyncio
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = input("Enter your API_ID: ").strip()
API_HASH = input("Enter your API_HASH: ").strip()


async def main():
    client = TelegramClient(StringSession(), int(API_ID), API_HASH)
    await client.start()

    session_string = client.session.save()
    print("\n" + "=" * 60)
    print("✅ Your SESSION_STRING (copy this into .env):")
    print("=" * 60)
    print(session_string)
    print("=" * 60 + "\n")

    await client.disconnect()


if __name__ == '__main__':
    asyncio.run(main())

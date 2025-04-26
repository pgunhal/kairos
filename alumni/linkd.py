import asyncio 
import websockets
from dotenv import load_dotenv
import os

load_dotenv()

async def connect_to_websocket():
    uri = "wss://search.linkd.inc/api/search/ws"
    api_key = os.getenv("LINKD_API_KEY")
    if not api_key:
        raise ValueError("API_KEY is not set in the .env file.")
    headers = {"Authorization": f"Bearer {api_key}"}
    websocket = await websockets.connect(uri, extra_headers=headers)
    print("Connected to WebSocket")
    return websocket 

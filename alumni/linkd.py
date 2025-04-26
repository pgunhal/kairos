import asyncio 
import websockets

async def connect_to_websocket():
    uri = "wss://search.linkd.inc/api/search/ws"
    api_key = ''
    headers = {"Authorization": f"Bearer {api_key}"}
    websocket = await websockets.connect(uri, extra_headers=headers)
    print("Connected to WebSocket")
    return websocket 

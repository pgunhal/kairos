import asyncio 
import websockets
from dotenv import load_dotenv
import json 
import os

load_dotenv()

async def connect_to_websocket():
    uri = f"wss://search.linkd.inc/api/search/ws"
    api_key = os.getenv("LINKD_API_KEY")
    if not api_key:
        raise ValueError("API_KEY is not set in the .env file.")
    headers = {"Authorization": f"Bearer {api_key}"}
    websocket = await websockets.connect(uri, extra_headers=headers)
    print("Connected to WebSocket")
    return websocket 

async def send_request(websocket, query, limit=30):
    request = {
        "query": query,
        "limit": limit, 
    }
    await websocket.send(json.dumps(request))
    response = await websocket.recv()
    print("Received response:", response)
    return response

async def main():
    websocket = await connect_to_websocket()
    try:
        query = "software engineer"
        limit = 30
        response = await send_request(websocket, query, limit)
        print("Response:", response)
    finally:
        await websocket.close()
        print("WebSocket closed")
if __name__ == "__main__":
    asyncio.run(main())
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio
from services.ai_service import ai_service
from database import SessionLocal
from models import Session

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)


manager = ConnectionManager()


def _save_session_to_db(user_id: int, scenario: str, transcript: list, dashboard: dict):
    """Sync function — saves a completed session to eunoia.db using built-in sqlite3."""
    db = SessionLocal()
    try:
        new_session = Session(
            user_id=user_id,
            scenario=scenario,
            transcript_json=json.dumps(transcript),
            dashboard_json=json.dumps(dashboard)
        )
        db.add(new_session)
        db.commit()
        print(f"✅ Session saved for user_id={user_id}")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Failed to save session: {e}")
    finally:
        db.close()


@router.websocket("/ws/session")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    current_chat = None
    current_user_id = None

    session_data = {"scenario": "", "transcript": [], "expressions": []}

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get('type')

                if msg_type == 'initialize':
                    scenario = message.get('scenario', 'General conversation')
                    session_data["scenario"] = scenario
                    current_user_id = message.get('user_id', None)
                    current_chat = ai_service.initialize_chat(scenario)

                    if current_chat:
                        first_response = await ai_service.get_response(current_chat, "Hello. I am ready to begin the scenario. Please start.")
                        session_data["transcript"].append({"role": "ai", "content": first_response})
                        await manager.send_personal_message(
                            json.dumps({"type": "ai_response", "text": first_response}), websocket
                        )
                    else:
                        await manager.send_personal_message(
                            json.dumps({"type": "error", "message": "Failed to initialize AI. Check API Key."}), websocket
                        )

                elif msg_type == 'transcription':
                    user_text = message.get('text', '')
                    if user_text and current_chat:
                        session_data["transcript"].append({"role": "user", "content": user_text})
                        ai_response_text = await ai_service.get_response(current_chat, user_text)
                        session_data["transcript"].append({"role": "ai", "content": ai_response_text})
                        await manager.send_personal_message(
                            json.dumps({"type": "ai_response", "text": ai_response_text}), websocket
                        )

                elif msg_type == 'expression_update':
                    session_data["expressions"].append({
                        "expression": message.get("expression"),
                        "timestamp": message.get("timestamp")
                    })

                elif msg_type == 'end_session':
                    summary = await ai_service.generate_dashboard_summary(
                        session_data["transcript"],
                        session_data["expressions"]
                    )

                    # Run the sync DB save in a thread so it doesn't block the async event loop
                    if current_user_id:
                        await asyncio.to_thread(
                            _save_session_to_db,
                            current_user_id,
                            session_data["scenario"],
                            session_data["transcript"],
                            summary
                        )

                    await manager.send_personal_message(
                        json.dumps({
                            "type": "dashboard_summary",
                            "data": summary,
                            "raw_expressions": session_data["expressions"]
                        }),
                        websocket
                    )

            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected")
    except Exception as e:
        manager.disconnect(websocket)
        print(f"Error: {e}")

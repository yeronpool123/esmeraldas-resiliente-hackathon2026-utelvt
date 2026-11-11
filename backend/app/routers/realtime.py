from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.db import get_session_factory
from app.models import Usuario
from app.realtime import operations_hub
from app.security import decode_token

router = APIRouter(tags=["Tiempo real"])


@router.websocket("/ws/operaciones")
async def operations_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        credentials = await websocket.receive_json()
        if not isinstance(credentials, dict) or not isinstance(credentials.get("access_token"), str):
            await websocket.close(code=4401, reason="Envía un token de acceso válido.")
            return
        payload = decode_token(credentials["access_token"])
        user_id = int(payload["sub"])
        async with get_session_factory()() as session:
            user = await session.scalar(select(Usuario).where(Usuario.id == user_id, Usuario.activo.is_(True)))
    except WebSocketDisconnect:
        return
    except HTTPException:
        await websocket.close(code=4401, reason="Autenticación WebSocket inválida.")
        return
    except (ValueError, KeyError, TypeError):
        await websocket.close(code=4401, reason="Autenticación WebSocket inválida.")
        return
    except SQLAlchemyError:
        await websocket.close(code=1011, reason="No se pudo validar la sesión.")
        return
    if user is None:
        await websocket.close(code=4401, reason="Usuario inactivo o inexistente.")
        return
    if user.rol not in {"OPERADOR_COE", "ADMIN"}:
        await websocket.close(code=4403, reason="Se requieren permisos de operador.")
        return

    await operations_hub.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await operations_hub.disconnect(websocket)

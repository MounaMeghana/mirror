import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Session as SessionModel
from schemas import SessionOut
from auth import require_current_user
from models import User

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/", response_model=list[SessionOut])
def get_my_sessions(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == current_user.id)
        .order_by(SessionModel.created_at.desc())
        .all()
    )

    return [
        SessionOut(
            id=s.id,
            scenario=s.scenario,
            dashboard_data=json.loads(s.dashboard_json) if s.dashboard_json else None,
            created_at=s.created_at
        )
        for s in sessions
    ]


@router.get("/{session_id}", response_model=SessionOut)
def get_session_detail(
    session_id: int,
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    session = (
        db.query(SessionModel)
        .filter(SessionModel.id == session_id, SessionModel.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return SessionOut(
        id=session.id,
        scenario=session.scenario,
        dashboard_data=json.loads(session.dashboard_json) if session.dashboard_json else None,
        created_at=session.created_at
    )

"""
database.py — SQLite setup using SYNCHRONOUS SQLAlchemy

WHY SYNC INSTEAD OF ASYNC?
  The original async version required `aiosqlite`, which has install issues on Python 3.14.
  The synchronous version uses Python's built-in `sqlite3` module (zero extra installs!).
  FastAPI handles sync route functions just fine — it runs them in a thread pool automatically,
  so the server stays fast and non-blocking.

HOW IT WORKS:
  engine    → the connection to eunoia.db
  SessionLocal → a factory that creates short-lived DB sessions (conversations with the DB)
  get_db()  → a FastAPI dependency — opens a session, gives it to the route, closes it after
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session

# sqlite:// (not sqlite+aiosqlite://) → uses built-in sqlite3, no extras needed
# check_same_thread=False is required for SQLite when used with FastAPI's thread pool
DATABASE_URL = "sqlite:///./eunoia.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# autocommit=False → we control when to save (db.commit())
# autoflush=False  → changes are only sent to DB when we explicitly flush/commit
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def init_db():
    """
    Creates all tables defined in models.py on first run.
    Reads your Python model classes and runs CREATE TABLE IF NOT EXISTS.
    Safe to call every startup — won't destroy existing data.
    """
    from models import User, Session as SessionModel  # noqa: F401 — imports register models
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized — eunoia.db is ready.")


def get_db():
    """
    FastAPI dependency — provides a database session to each request.

    Usage in a route:
        def my_route(db: Session = Depends(get_db)):
            users = db.query(User).all()

    The try/finally guarantees the session is always closed, even on errors.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

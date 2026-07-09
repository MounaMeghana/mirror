import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import ws_router
from routers import auth_router, sessions_router

# Initialize DB once at startup (sync call, safe at module level)
init_db()

app = FastAPI(title="AI Cognitive Mirror API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_router.router)
app.include_router(auth_router.router)
app.include_router(sessions_router.router)


@app.get("/")
async def root():
    return {"message": "AI Cognitive Mirror API is running"}

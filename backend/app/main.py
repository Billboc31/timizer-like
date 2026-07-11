from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from app.db import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    connection = engine.connect()
    try:
        connection.execute(text("SELECT 1"))
    finally:
        connection.close()
    yield


app = FastAPI(title="Timizer backend", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"database unavailable: {exc}") from exc
    return {"status": "ok", "database": "sqlite"}

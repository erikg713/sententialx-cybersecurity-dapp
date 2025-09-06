# backend/app/config/db.py
import os
import asyncpg
from databases import Database

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/sentenialx")

database = Database(DATABASE_URL)

async def connect_db():
    await database.connect()

async def disconnect_db():
    await database.disconnect()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import teams, batting, bowling, venues, search, players

app = FastAPI(
    title="IPL Analytics Platform API",
    description="REST API for historical IPL performance stats",
    version="1.0",
)

# Allow React web & React Native app to consume the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(teams.router, prefix="/api/v1")
app.include_router(batting.router, prefix="/api/v1")
app.include_router(bowling.router, prefix="/api/v1")
app.include_router(venues.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(players.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "IPL Platform API is running"}

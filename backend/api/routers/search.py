from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import datetime

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/")
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    # Ensure pg_trgm is available in the session (idempotent)
    db.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm;"))
    db.commit()

    # Search for players
    player_query = text("""
        SELECT DISTINCT player_name as title, 'player' as type, 
               MAX(team) as subtitle,
               '/batting' as url,
               similarity(player_name, :q) as score
        FROM ipl.mart_batting
        WHERE player_name % :q OR player_name ILIKE :q_like
        GROUP BY player_name
        ORDER BY score DESC
        LIMIT 5
    """)

    # Search for teams
    team_query = text("""
        SELECT DISTINCT team as title, 'team' as type,
               'IPL Franchise' as subtitle,
               '/teams' as url,
               similarity(team, :q) as score
        FROM ipl.mart_teams
        WHERE team % :q OR team ILIKE :q_like
        ORDER BY score DESC
        LIMIT 3
    """)

    # Search for venues
    venue_query = text("""
        SELECT DISTINCT venue as title, 'venue' as type,
               city as subtitle,
               '/venues' as url,
               similarity(venue, :q) as score
        FROM ipl.mart_venues
        WHERE venue % :q OR venue ILIKE :q_like OR city ILIKE :q_like
        ORDER BY score DESC
        LIMIT 3
    """)

    q_like = f"%{q}%"
    params = {"q": q, "q_like": q_like}

    players = [
        dict(row._mapping) for row in db.execute(player_query, params).fetchall()
    ]
    teams = [dict(row._mapping) for row in db.execute(team_query, params).fetchall()]
    venues = [dict(row._mapping) for row in db.execute(venue_query, params).fetchall()]

    all_results = players + teams + venues
    # Sort by similarity score
    all_results.sort(key=lambda x: x["score"], reverse=True)

    # Attach IDs for frontend
    for i, res in enumerate(all_results):
        res["id"] = f"res_{i}"
        # Convert any float scores to float just in case
        res["score"] = float(res["score"])

    return {
        "data": all_results,
        "meta": {"query": q, "total": len(all_results)},
        "generated_at": datetime.datetime.now().isoformat(),
    }

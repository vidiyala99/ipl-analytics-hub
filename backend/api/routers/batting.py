from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, get_cache, set_cache
import datetime

router = APIRouter(prefix="/batting", tags=["batting"])


@router.get("/leaderboard")
def get_batting_leaderboard(
    db: Session = Depends(get_db),
    limit: int = Query(50, le=200),
    sort_by: str = Query(
        "total_runs",
        regex="^(total_runs|average|batting_average|strike_rate|hundreds|fifties)$",
    ),
    search: str = Query(None),
):
    cache_key = f"batting:leaderboard:{sort_by}:{limit}:{search}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    # Map frontend keys to actual query alias names
    sort_mapping = {
        "total_runs": "total_runs",
        "average": "batting_average",
        "batting_average": "batting_average",
        "strike_rate": "strike_rate",
        "hundreds": "hundreds",
        "fifties": "fifties",
    }

    actual_sort_column = sort_mapping.get(sort_by, "total_runs")

    # Basic sanitized string interpolation for sort column
    # Add optional search filter
    where_clause = "WHERE total_runs > 0"
    if search:
        where_clause += f" AND player_name ILIKE :search"

    query = text(f"""
        SELECT player_name, MAX(team) as team, 
               SUM(matches_played) as matches,
               SUM(total_runs) as total_runs,
               SUM(total_balls_faced) as total_balls_faced,
               SUM(hundreds) as hundreds,
               SUM(fifties) as fifties,
               CASE 
                 WHEN SUM(times_dismissed) > 0 THEN ROUND((SUM(total_runs)*1.0 / SUM(times_dismissed)), 2)
                 ELSE NULL
               END as batting_average,
               CASE
                 WHEN SUM(total_balls_faced) > 0 THEN ROUND((SUM(total_runs)*1.0 / SUM(total_balls_faced)) * 100, 2)
                 ELSE 0
               END as strike_rate
        FROM ipl.mart_batting
        {where_clause}
        GROUP BY player_name
        ORDER BY {actual_sort_column} DESC NULLS LAST
        LIMIT :limit
    """)
    result = db.execute(
        query, {"limit": limit, "search": f"%{search}%" if search else None}
    ).fetchall()
    data = []
    from decimal import Decimal

    for row in result:
        r = dict(row._mapping)
        # Cast decimals for JSON serialization
        for key, val in r.items():
            if isinstance(val, Decimal):
                # If it looks like a round number (runs, matches, counts), cast to int
                if key in [
                    "matches",
                    "total_runs",
                    "total_balls_faced",
                    "hundreds",
                    "fifties",
                ]:
                    r[key] = int(val)
                else:
                    r[key] = float(val)
        data.append(r)

    response = {
        "data": data,
        "meta": {"limit": limit, "sort_by": sort_by, "total": len(data)},
        "generated_at": datetime.datetime.now().isoformat(),
    }
    set_cache(cache_key, response, expire=3600)
    return response


@router.get("/player/{player_name}")
def get_batting_player(player_name: str, db: Session = Depends(get_db)):
    query = text("""
        SELECT season, team, matches_played, total_runs, batting_average, strike_rate, hundreds, fifties
        FROM ipl.mart_batting
        WHERE player_name = :player_name
        ORDER BY season
    """)
    result = db.execute(query, {"player_name": player_name}).fetchall()
    if not result:
        return {"data": [], "meta": {"player": player_name, "found": False}}

    data = [dict(row._mapping) for row in result]
    return {
        "data": data,
        "meta": {"player": player_name, "total_seasons": len(data)},
        "generated_at": datetime.datetime.now().isoformat(),
    }

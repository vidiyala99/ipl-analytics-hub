from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db, get_cache, set_cache
import datetime

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("/")
def get_all_teams(db: Session = Depends(get_db), search: str = Query(None)):
    cache_key = f"teams:all:{search}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    where_clause = ""
    if search:
        where_clause = "WHERE team ILIKE :search"

    query = text(f"""
        SELECT team, SUM(total_matches) as matches, SUM(total_wins) as wins, 
               SUM(total_losses) as losses
        FROM ipl.mart_teams
        {where_clause}
        GROUP BY team
        ORDER BY wins DESC
    """)
    result = db.execute(query, {"search": f"%{search}%" if search else None}).fetchall()
    data = []
    from decimal import Decimal

    for row in result:
        r = dict(row._mapping)
        for key, val in r.items():
            if isinstance(val, Decimal):
                r[key] = int(val)
        data.append(r)

    response = {
        "data": data,
        "meta": {"total": len(data)},
        "generated_at": datetime.datetime.now().isoformat(),
    }

    set_cache(cache_key, response, expire=3600)
    return response


@router.get("/{team_name}/seasons")
def get_team_seasons(team_name: str, db: Session = Depends(get_db)):
    cache_key = f"teams:seasons:{team_name}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    query = text("""
        SELECT season, total_matches, total_wins, total_losses, win_percentage
        FROM ipl.mart_teams
        WHERE team = :team_name
        ORDER BY season
    """)
    result = db.execute(query, {"team_name": team_name}).fetchall()
    data = []
    from decimal import Decimal

    for row in result:
        r = dict(row._mapping)
        for key, val in r.items():
            if isinstance(val, Decimal):
                if key == "win_percentage":
                    r[key] = float(val)
                else:
                    r[key] = int(val)
        data.append(r)

    response = {
        "data": data,
        "meta": {"team": team_name, "total_seasons": len(data)},
        "generated_at": datetime.datetime.now().isoformat(),
    }
    set_cache(cache_key, response, expire=3600)
    return response

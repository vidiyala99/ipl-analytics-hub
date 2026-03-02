from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db, get_cache, set_cache
import datetime

router = APIRouter(prefix="/venues", tags=["venues"])


@router.get("/")
def get_all_venues(db: Session = Depends(get_db), search: str = Query(None)):
    cache_key = f"venues:all:{search}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    where_clause = ""
    if search:
        where_clause = "WHERE venue ILIKE :search OR city ILIKE :search"

    query = text(f"""
        SELECT venue, city, country, total_matches, 
               avg_runs_per_wicket, avg_runs_per_over, 
               toss_winner_win_percentage
        FROM ipl.mart_venues
        {where_clause}
        ORDER BY total_matches DESC
    """)
    result = db.execute(query, {"search": f"%{search}%" if search else None}).fetchall()
    data = []
    from decimal import Decimal

    for row in result:
        r = dict(row._mapping)
        for key, val in r.items():
            if isinstance(val, Decimal):
                if key == "total_matches":
                    r[key] = int(val)
                else:
                    r[key] = float(val)
        data.append(r)

    response = {
        "data": data,
        "meta": {"total": len(data)},
        "generated_at": datetime.datetime.now().isoformat(),
    }

    set_cache(cache_key, response, expire=3600)
    return response


@router.get("/{city}")
def get_city_venues(city: str, db: Session = Depends(get_db)):
    query = text("""
        SELECT venue, total_matches, avg_runs_per_wicket, avg_runs_per_over
        FROM ipl.mart_venues
        WHERE city = :city
        ORDER BY total_matches DESC
    """)
    result = db.execute(query, {"city": city}).fetchall()
    data = [dict(row._mapping) for row in result]
    return {"data": data}

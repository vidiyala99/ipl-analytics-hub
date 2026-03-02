from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, get_cache, set_cache
import datetime

router = APIRouter(prefix="/bowling", tags=["bowling"])


@router.get("/leaderboard")
def get_bowling_leaderboard(
    db: Session = Depends(get_db),
    limit: int = Query(50, le=200),
    sort_by: str = Query(
        "wickets",
        regex="^(wickets|total_wickets|economy|economy_rate|average|bowling_average|strike_rate|five_wkt_hauls)$",
    ),
    search: str = Query(None),
):
    cache_key = f"bowling:leaderboard:{sort_by}:{limit}:{search}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    sort_mapping = {
        "wickets": "total_wickets",
        "total_wickets": "total_wickets",
        "economy": "economy_rate",
        "economy_rate": "economy_rate",
        "average": "bowling_average",
        "bowling_average": "bowling_average",
        "strike_rate": "bowling_strike_rate",
        "five_wkt_hauls": "five_wicket_hauls",
    }

    actual_sort_column = sort_mapping.get(sort_by, "total_wickets")
    order_dir = (
        "ASC" if actual_sort_column in ["economy_rate", "bowling_average"] else "DESC"
    )

    where_clause = "WHERE total_balls_bowled > 0"
    if search:
        where_clause += f" AND player_name ILIKE :search"

    query = text(f"""
        SELECT player_name, MAX(team) as team, 
               SUM(matches_played) as matches,
               SUM(total_wickets) as total_wickets,
               SUM(total_balls_bowled) as total_balls_bowled,
               SUM(total_runs_conceded) as total_runs_conceded,
               SUM(four_wicket_hauls) as four_wicket_hauls,
               SUM(five_wicket_hauls) as five_wicket_hauls,
               
               CASE 
                   WHEN SUM(total_balls_bowled) > 0 THEN ROUND((SUM(total_runs_conceded)*1.0 / (SUM(total_balls_bowled) / 6.0)), 2)
                   ELSE NULL
               END as economy_rate,
               
               CASE
                   WHEN SUM(total_wickets) > 0 THEN ROUND((SUM(total_runs_conceded)*1.0 / SUM(total_wickets)), 2)
                   ELSE NULL
               END as bowling_average,

               CASE
                   WHEN SUM(total_wickets) > 0 THEN ROUND((SUM(total_balls_bowled)*1.0 / SUM(total_wickets)), 2)
                   ELSE NULL
               END as bowling_strike_rate

        FROM ipl.mart_bowling
        {where_clause}
        GROUP BY player_name
        ORDER BY {actual_sort_column} {order_dir} NULLS LAST
        LIMIT :limit
    """)
    result = db.execute(
        query, {"limit": limit, "search": f"%{search}%" if search else None}
    ).fetchall()

    data = []
    from decimal import Decimal

    for row in result:
        r = dict(row._mapping)
        for key, val in r.items():
            if isinstance(val, Decimal):
                if key in [
                    "matches",
                    "total_wickets",
                    "total_balls_bowled",
                    "total_runs_conceded",
                    "four_wicket_hauls",
                    "five_wicket_hauls",
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

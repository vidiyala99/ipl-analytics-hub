from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import datetime

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/{player_name}")
def get_player_profile(player_name: str, db: Session = Depends(get_db)):
    # Batting Stats
    batting_query = text("""
        SELECT season, team, matches_played, total_runs, 
               CASE WHEN times_dismissed > 0 THEN ROUND(total_runs*1.0/times_dismissed, 2) ELSE total_runs END as average,
               ROUND(strike_rate, 2) as strike_rate, hundreds, fifties
        FROM ipl.mart_batting
        WHERE player_name = :player_name
        ORDER BY season DESC
    """)

    # Bowling Stats
    bowling_query = text("""
        SELECT season, team, matches_played, total_wickets as wickets,
               ROUND(economy_rate, 2) as economy, 
               ROUND(bowling_average, 2) as average,
               five_wicket_hauls as five_w
        FROM ipl.mart_bowling
        WHERE player_name = :player_name
        ORDER BY season DESC
    """)

    batting_res = db.execute(batting_query, {"player_name": player_name}).fetchall()
    bowling_res = db.execute(bowling_query, {"player_name": player_name}).fetchall()

    if not batting_res and not bowling_res:
        raise HTTPException(status_code=404, detail="Player not found")

    batting_data = [dict(row._mapping) for row in batting_res]
    bowling_data = [dict(row._mapping) for row in bowling_res]

    # Overall Summary
    summary = {
        "player_name": player_name,
        "total_runs": sum(d["total_runs"] for d in batting_data) if batting_data else 0,
        "total_wickets": sum(d["wickets"] for d in bowling_data) if bowling_data else 0,
        "matches": max((d["matches_played"] for d in batting_data), default=0)
        if batting_data
        else max((d["matches_played"] for d in bowling_data), default=0),
        "teams": list(
            set([d["team"] for d in batting_data] + [d["team"] for d in bowling_data])
        ),
    }

    return {
        "player": summary,
        "batting": batting_data,
        "bowling": bowling_data,
        "generated_at": datetime.datetime.now().isoformat(),
    }

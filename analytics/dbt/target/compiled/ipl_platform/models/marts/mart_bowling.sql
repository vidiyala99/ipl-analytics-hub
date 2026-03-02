WITH bowler_innings AS (
    SELECT * FROM "ipl_data"."ipl"."int_bowler_innings"
),
matches AS (
    SELECT match_id, season FROM "ipl_data"."ipl"."stg_matches_clean"
)

SELECT
    b.player_name,
    m.season,
    b.bowling_team AS team,
    
    COUNT(b.match_id) AS matches_played,
    SUM(b.balls_bowled) AS total_balls_bowled,
    SUM(b.runs_conceded) AS total_runs_conceded,
    SUM(b.wickets_taken) AS total_wickets,
    SUM(b.dot_balls) AS total_dot_balls,
    
    -- Economy Rate = Runs / Overs (Overs = Balls / 6)
    CASE 
        WHEN SUM(b.balls_bowled) > 0 THEN ROUND((SUM(b.runs_conceded)*1.0 / (SUM(b.balls_bowled) / 6.0)), 2)
        ELSE NULL
    END AS economy_rate,
    
    -- Bowling Average = Runs / Wickets
    CASE
        WHEN SUM(b.wickets_taken) > 0 THEN ROUND((SUM(b.runs_conceded)*1.0 / SUM(b.wickets_taken)), 2)
        ELSE NULL
    END AS bowling_average,
    
    -- Strike Rate = Balls / Wickets
    CASE
        WHEN SUM(b.wickets_taken) > 0 THEN ROUND((SUM(b.balls_bowled)*1.0 / SUM(b.wickets_taken)), 2)
        ELSE NULL
    END AS bowling_strike_rate,
    
    -- Milestones
    SUM(CASE WHEN b.wickets_taken >= 4 AND b.wickets_taken < 5 THEN 1 ELSE 0 END) AS four_wicket_hauls,
    SUM(CASE WHEN b.wickets_taken >= 5 THEN 1 ELSE 0 END) AS five_wicket_hauls

FROM bowler_innings b
JOIN matches m ON b.match_id = m.match_id
GROUP BY 
    b.player_name, 
    m.season,
    b.bowling_team
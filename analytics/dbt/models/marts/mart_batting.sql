WITH batter_innings AS (
    SELECT * FROM {{ ref('int_batter_innings') }}
),
matches AS (
    SELECT match_id, season FROM {{ ref('stg_matches_clean') }}
)

SELECT
    b.player_name,
    m.season,
    b.batting_team AS team,
    
    COUNT(b.match_id) AS matches_played,
    SUM(b.runs_scored) AS total_runs,
    SUM(b.fours) AS total_fours,
    SUM(b.sixes) AS total_sixes,
    SUM(b.balls_faced) AS total_balls_faced,
    
    SUM(b.is_dismissed) AS times_dismissed,
    
    -- Average = Runs / Outs
    CASE 
        WHEN SUM(b.is_dismissed) > 0 THEN ROUND((SUM(b.runs_scored)*1.0 / SUM(b.is_dismissed)), 2)
        ELSE NULL
    END AS batting_average,
    
    -- Strike Rate = (Runs / Balls) * 100
    CASE
        WHEN SUM(b.balls_faced) > 0 THEN ROUND((SUM(b.runs_scored)*1.0 / SUM(b.balls_faced)) * 100, 2)
        ELSE 0 
    END AS strike_rate,
    
    -- Milestones
    SUM(CASE WHEN b.runs_scored >= 50 AND b.runs_scored < 100 THEN 1 ELSE 0 END) AS fifties,
    SUM(CASE WHEN b.runs_scored >= 100 THEN 1 ELSE 0 END) AS hundreds

FROM batter_innings b
JOIN matches m ON b.match_id = m.match_id
GROUP BY 
    b.player_name, 
    m.season,
    b.batting_team

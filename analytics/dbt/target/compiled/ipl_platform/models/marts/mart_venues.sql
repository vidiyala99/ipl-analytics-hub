WITH matches AS (
    SELECT * FROM "ipl_data"."ipl"."stg_matches_clean"
),
innings_scores AS (
    SELECT 
        match_id,
        inning_num,
        SUM(runs_total) AS innings_total
    FROM "ipl_data"."ipl"."stg_deliveries_clean"
    GROUP BY match_id, inning_num
),
venue_match_stats AS (
    SELECT 
        m.venue,
        m.city,
        m.match_id,
        m.toss_decision,
        m.win_by_runs,
        m.win_by_wickets,
        
        -- Get 1st innings total
        MAX(CASE WHEN i.inning_num = 1 THEN i.innings_total ELSE 0 END) AS first_innings_score,
        
        -- Identify if team batting first won
        CASE WHEN m.win_by_runs > 0 THEN 1 ELSE 0 END AS bat_first_win
        
    FROM matches m
    LEFT JOIN innings_scores i ON m.match_id = i.match_id
    GROUP BY 
        m.venue, m.city, m.match_id, m.toss_decision, m.win_by_runs, m.win_by_wickets
)

SELECT
    venue,
    city,
    COUNT(match_id) AS total_matches_played,
    
    -- Average scores
    ROUND(AVG(first_innings_score), 0) AS avg_first_innings_score,
    
    -- Win tendencies
    SUM(bat_first_win) AS times_bat_first_won,
    COUNT(match_id) - SUM(bat_first_win) AS times_chase_won,
    
    -- Toss tendencies
    SUM(CASE WHEN toss_decision = 'field' THEN 1 ELSE 0 END) AS times_toss_decision_field,
    SUM(CASE WHEN toss_decision = 'bat' THEN 1 ELSE 0 END) AS times_toss_decision_bat

FROM venue_match_stats
WHERE venue IS NOT NULL
GROUP BY venue, city
ORDER BY total_matches_played DESC
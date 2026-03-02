WITH deliveries AS (
    SELECT * FROM "ipl_data"."ipl"."stg_deliveries_clean"
),
batter_aggs AS (
    SELECT 
        match_id,
        inning_num,
        batting_team,
        batter AS player_name,
        
        SUM(runs_batter) AS runs_scored,
        SUM(is_four) AS fours,
        SUM(is_six) AS sixes,
        SUM(is_valid_ball) AS balls_faced,
        
        -- dismissed flag
        MAX(CASE WHEN player_dismissed = batter THEN 1 ELSE 0 END) AS is_dismissed,
        MAX(CASE WHEN player_dismissed = batter THEN bowler ELSE NULL END) AS dismissed_by,
        MAX(CASE WHEN player_dismissed = batter THEN dismissal_kind ELSE NULL END) AS dismissal_method
        
    FROM deliveries
    GROUP BY 
        match_id,
        inning_num,
        batting_team,
        batter
)
SELECT * FROM batter_aggs
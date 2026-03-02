WITH raw_deliveries AS (
    SELECT * FROM "ipl_data"."ipl"."stg_deliveries"
)

SELECT
    match_id::VARCHAR AS match_id,
    inning::INT AS inning_num,
    batting_team::VARCHAR AS batting_team,
    bowling_team::VARCHAR AS bowling_team,
    over::INT AS over_num,
    ball::INT AS ball_num,
    batter::VARCHAR AS batter,
    non_striker::VARCHAR AS non_striker,
    bowler::VARCHAR AS bowler,
    runs_batter::INT AS runs_batter,
    runs_extras::INT AS runs_extras,
    runs_total::INT AS runs_total,
    extras::JSONB AS extras,
    player_dismissed::VARCHAR AS player_dismissed,
    dismissal_kind::VARCHAR AS dismissal_kind,
    fielder::VARCHAR AS fielder,
    
    -- Derived Boundary Flags
    CASE WHEN runs_batter = 4 THEN 1 ELSE 0 END AS is_four,
    CASE WHEN runs_batter = 6 THEN 1 ELSE 0 END AS is_six,
    
    -- Derived Wicket Flag
    CASE WHEN player_dismissed IS NOT NULL THEN 1 ELSE 0 END AS is_wicket,
    
    -- Wide / No-Ball check for valid ball counting (extras -> w/nb)
    CASE 
        WHEN extras IS NOT NULL AND (extras::JSONB->>'wides' IS NOT NULL OR extras::JSONB->>'noballs' IS NOT NULL) THEN 0 
        ELSE 1 
    END AS is_valid_ball,
    
    -- Phase Tagging (Assuming standard T20 phases: 0-5 PP, 6-14 Middle, 15-19 Death)
    CASE 
        WHEN over >= 0 AND over <= 5 THEN 'Powerplay'
        WHEN over >= 6 AND over <= 14 THEN 'Middle'
        WHEN over >= 15 AND over <= 19 THEN 'Death'
        ELSE 'Other'
    END AS match_phase
    
FROM raw_deliveries

  create view "ipl_data"."ipl"."int_bowler_innings__dbt_tmp"
    
    
  as (
    WITH deliveries AS (
    SELECT * FROM "ipl_data"."ipl"."stg_deliveries_clean"
),
bowler_aggs AS (
    SELECT 
        match_id,
        inning_num,
        bowling_team,
        bowler AS player_name,
        
        SUM(is_valid_ball) AS balls_bowled,
        SUM(runs_batter + runs_extras) AS runs_conceded,
        SUM(CASE 
            WHEN is_wicket = 1 AND dismissal_kind NOT IN ('run out', 'retired hurt', 'obstructing the field') 
            THEN 1 ELSE 0 
        END) AS wickets_taken,
        
        SUM(CASE WHEN is_valid_ball = 1 AND runs_batter = 0 AND runs_extras = 0 THEN 1 ELSE 0 END) AS dot_balls
        
    FROM deliveries
    GROUP BY 
        match_id,
        inning_num,
        bowling_team,
        bowler
)
SELECT * FROM bowler_aggs
  );
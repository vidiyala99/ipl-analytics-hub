-- Match results aggregated data
WITH match_info AS (
    SELECT * FROM {{ ref('stg_matches_clean') }}
),
team_stats AS (
    SELECT
        match_id,
        team1,
        team2,
        winner,
        CASE WHEN winner = team1 THEN team2 ELSE team1 END AS loser,
        win_by_runs,
        win_by_wickets,
        result_type,
        method
    FROM match_info
    WHERE result_type != 'no result' 
      AND result_type != 'abandoned'
)

SELECT * FROM team_stats

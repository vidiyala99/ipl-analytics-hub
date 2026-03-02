WITH match_results AS (
    SELECT * FROM {{ ref('int_match_result') }}
),
team_performance AS (
    SELECT
        match_results.team1 AS team,
        m.season,
        COUNT(match_results.match_id) AS matches_played,
        SUM(CASE WHEN match_results.winner = match_results.team1 THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN match_results.loser = match_results.team1 THEN 1 ELSE 0 END) AS losses
    FROM match_results
    JOIN {{ ref('stg_matches_clean') }} m USING (match_id)
    GROUP BY match_results.team1, m.season
    
    UNION ALL

    SELECT
        match_results.team2 AS team,
        m.season,
        COUNT(match_results.match_id) AS matches_played,
        SUM(CASE WHEN match_results.winner = match_results.team2 THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN match_results.loser = match_results.team2 THEN 1 ELSE 0 END) AS losses
    FROM match_results
    JOIN {{ ref('stg_matches_clean') }} m USING (match_id)
    GROUP BY match_results.team2, m.season
)

SELECT
    team,
    season,
    SUM(matches_played) AS total_matches,
    SUM(wins) AS total_wins,
    SUM(losses) AS total_losses,
    
    CASE 
        WHEN SUM(matches_played) > 0 THEN ROUND((SUM(wins)*1.0 / SUM(matches_played)) * 100, 2)
        ELSE 0
    END AS win_percentage

FROM team_performance
GROUP BY team, season

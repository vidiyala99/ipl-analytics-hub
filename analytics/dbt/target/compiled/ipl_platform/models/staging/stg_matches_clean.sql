WITH raw_matches AS (
    SELECT * FROM "ipl_data"."ipl"."stg_matches"
)

SELECT
    match_id::VARCHAR AS match_id,
    season::VARCHAR AS season,
    match_date::DATE AS match_date,
    team1::VARCHAR AS team1,
    team2::VARCHAR AS team2,
    venue::VARCHAR AS venue,
    city::VARCHAR AS city,
    toss_winner::VARCHAR AS toss_winner,
    toss_decision::VARCHAR AS toss_decision,
    winner::VARCHAR AS winner,
    win_by_runs::INT AS win_by_runs,
    win_by_wickets::INT AS win_by_wickets,
    result_type::VARCHAR AS result_type,
    method::VARCHAR AS method,
    player_of_match::VARCHAR AS player_of_match
FROM raw_matches
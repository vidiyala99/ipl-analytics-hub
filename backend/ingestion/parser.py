import os
import json
import pandas as pd
from datetime import datetime


class CricsheetParser:
    def __init__(self, data_dir):
        self.data_dir = data_dir

    def parse_all(self):
        match_rows = []
        delivery_rows = []

        # Only process JSON files, ignore README.txt etc.
        files = [f for f in os.listdir(self.data_dir) if f.endswith(".json")]
        print(f"Found {len(files)} matches to parse.")

        for idx, filename in enumerate(files):
            filepath = os.path.join(self.data_dir, filename)
            match_id = filename.split(".")[0]

            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            info = data.get("info", {})
            innings = data.get("innings", [])

            # --- Parse Match Info ---
            # Dates
            dates = info.get("dates", [])
            match_date = dates[0] if dates else None

            # Teams
            teams = info.get("teams", [None, None])
            team1 = teams[0] if len(teams) > 0 else None
            team2 = teams[1] if len(teams) > 1 else None

            # Toss
            toss = info.get("toss", {})
            toss_winner = toss.get("winner")
            toss_decision = toss.get("decision")

            # Outcome
            outcome = info.get("outcome", {})
            winner = outcome.get("winner")
            result_by = outcome.get("by", {})
            win_by_runs = result_by.get("runs")
            win_by_wickets = result_by.get("wickets")
            result_type = outcome.get("result")  # e.g., 'tie', 'no result'

            # Method/DLS
            method = outcome.get("method")

            # Player of match
            pom = (
                info.get("player_of_match", [None])[0]
                if info.get("player_of_match")
                else None
            )

            # Venue/City
            venue = info.get("venue")
            city = info.get("city")

            match_rows.append(
                {
                    "match_id": match_id,
                    "season": info.get("season"),
                    "match_date": match_date,
                    "team1": team1,
                    "team2": team2,
                    "venue": venue,
                    "city": city,
                    "toss_winner": toss_winner,
                    "toss_decision": toss_decision,
                    "winner": winner,
                    "win_by_runs": win_by_runs,
                    "win_by_wickets": win_by_wickets,
                    "result_type": result_type,
                    "method": method,
                    "player_of_match": pom,
                }
            )

            # --- Parse Deliveries ---
            for inning_idx, inning in enumerate(innings):
                inning_num = inning_idx + 1
                batting_team = inning.get("team")
                bowling_team = team2 if batting_team == team1 else team1

                # Cricsheet's newer format: innings block -> list of over dicts
                if "overs" in inning:
                    for over_dict in inning["overs"]:
                        over_num = over_dict.get("over")
                        for ball_idx, delivery in enumerate(
                            over_dict.get("deliveries", [])
                        ):
                            self._extract_delivery(
                                delivery_rows,
                                match_id,
                                inning_num,
                                batting_team,
                                bowling_team,
                                over_num,
                                ball_idx + 1,
                                delivery,
                            )
                elif (
                    "deliveries" in inning
                ):  # backwards compatibility for older json structures if any
                    for delivery_nested in inning["deliveries"]:
                        # The dict key is the over.ball format e.g. "0.1"
                        for over_ball_str, delivery in delivery_nested.items():
                            try:
                                o, b = map(int, over_ball_str.split("."))
                            except ValueError:
                                o, b = 0, 0
                            self._extract_delivery(
                                delivery_rows,
                                match_id,
                                inning_num,
                                batting_team,
                                bowling_team,
                                o,
                                b,
                                delivery,
                            )

            if (idx + 1) % 100 == 0:
                print(f"Parsed {idx + 1}/{len(files)} files...")

        df_matches = pd.DataFrame(match_rows)
        df_deliveries = pd.DataFrame(delivery_rows)
        return df_matches, df_deliveries

    def _extract_delivery(
        self,
        delivery_rows,
        match_id,
        inning_num,
        batting_team,
        bowling_team,
        over_num,
        ball_num,
        delivery,
    ):
        batter = delivery.get("batter")
        non_striker = delivery.get("non_striker")
        bowler = delivery.get("bowler")

        runs = delivery.get("runs", {})
        runs_batter = runs.get("batter", 0)
        runs_extras = runs.get("extras", 0)
        runs_total = runs.get("total", 0)

        extras_dict = delivery.get("extras", {})
        # Store extras as JSON string to accommodate sparse options
        extras_json = json.dumps(extras_dict) if extras_dict else None

        wickets = delivery.get("wickets", [])
        player_dismissed = None
        dismissal_kind = None
        fielder = None

        if wickets:
            w = wickets[0]
            player_dismissed = w.get("player_out")
            dismissal_kind = w.get("kind")
            fielders = w.get("fielders", [])
            if fielders:
                fielder = fielders[0].get("name")

        delivery_rows.append(
            {
                "match_id": match_id,
                "inning": inning_num,
                "batting_team": batting_team,
                "bowling_team": bowling_team,
                "over": over_num,
                "ball": ball_num,
                "batter": batter,
                "non_striker": non_striker,
                "bowler": bowler,
                "runs_batter": runs_batter,
                "runs_extras": runs_extras,
                "runs_total": runs_total,
                "extras": extras_json,
                "player_dismissed": player_dismissed,
                "dismissal_kind": dismissal_kind,
                "fielder": fielder,
            }
        )

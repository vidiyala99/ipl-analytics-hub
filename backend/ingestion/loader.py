import os
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime

# Database connection details
DB_USER = os.getenv("POSTGRES_USER", "ipl_user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "ipl_password")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5433")
DB_NAME = os.getenv("POSTGRES_DB", "ipl_data")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


class DatabaseLoader:
    def __init__(self):
        self.engine = create_engine(DATABASE_URL)
        # Create schema if it doesn't exist
        with self.engine.connect() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS ipl;"))
            conn.commit()

    def apply_data_quality(self, df_matches, df_deliveries):
        print("Applying Data Quality Rules...")
        # Rule 1: Nulls - quarantine deliveries missing critical fields
        # Using batter, non_striker, bowler as proxies for 'player_name', and batting_team for 'team'
        critical_fields = ["match_id", "batter", "bowler", "batting_team"]

        # Identify quarantined deliveries
        quarantined_mask = df_deliveries[critical_fields].isnull().any(axis=1)
        df_quarantine = df_deliveries[quarantined_mask].copy()
        if not df_quarantine.empty:
            df_quarantine["quarantine_reason"] = "Missing critical field"
            df_quarantine["quarantined_at"] = datetime.now()
            print(f"Quarantined {len(df_quarantine)} delivery rows.")

        # Filter out from main deliveries
        df_clean_deliveries = df_deliveries[~quarantined_mask].copy()

        return df_matches, df_clean_deliveries, df_quarantine

    def load_data(self, df_matches, df_deliveries, df_quarantine):
        print("Loading data to PostgreSQL...")

        # In a real environment, we'd handle upserts (ON CONFLICT DO NOTHING)
        # For first load, replace/append is sufficient. Here we use 'replace' to ensure idempotent full-refresh for v1.0 staging.

        if not df_matches.empty:
            df_matches.to_sql(
                "stg_matches",
                self.engine,
                schema="ipl",
                if_exists="replace",
                index=False,
            )
            print(f"Loaded {len(df_matches)} matches into ipl.stg_matches.")

        if not df_deliveries.empty:
            # Enforce data types for numeric metrics
            df_deliveries["runs_batter"] = pd.to_numeric(
                df_deliveries["runs_batter"], errors="coerce"
            )
            df_deliveries["runs_extras"] = pd.to_numeric(
                df_deliveries["runs_extras"], errors="coerce"
            )
            df_deliveries["runs_total"] = pd.to_numeric(
                df_deliveries["runs_total"], errors="coerce"
            )

            df_deliveries.to_sql(
                "stg_deliveries",
                self.engine,
                schema="ipl",
                if_exists="replace",
                index=False,
            )
            print(f"Loaded {len(df_deliveries)} deliveries into ipl.stg_deliveries.")

        if not df_quarantine.empty:
            df_quarantine.to_sql(
                "dq_quarantine",
                self.engine,
                schema="ipl",
                if_exists="append",
                index=False,
            )
            print(f"Loaded {len(df_quarantine)} records into ipl.dq_quarantine.")

        print("Done loading data.")

import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres.qjorhfkksrytopuamuuk:mUtNJwa1L7YAJyjP@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    m_count = conn.execute(text("SELECT COUNT(*) FROM ipl.stg_matches")).scalar()
    d_count = conn.execute(text("SELECT COUNT(*) FROM ipl.stg_deliveries")).scalar()
    print(f"Matches: {m_count}")
    print(f"Deliveries: {d_count}")

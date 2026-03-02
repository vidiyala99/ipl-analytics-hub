import os
from .download_data import download_and_extract
from .parser import CricsheetParser
from .loader import DatabaseLoader

URL = "https://cricsheet.org/downloads/ipl_json.zip"


def main():
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data")
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    print("--- 1. Extraction ---")
    files = [f for f in os.listdir(data_dir) if f.endswith(".json")]
    if len(files) == 0:
        download_and_extract(URL, data_dir)

    print("--- 2. Parsing ---")
    parser = CricsheetParser(data_dir)
    df_matches, df_deliveries = parser.parse_all()

    print("--- 3. Loading ---")
    try:
        loader = DatabaseLoader()
        df_m, df_d, df_q = loader.apply_data_quality(df_matches, df_deliveries)
        loader.load_data(df_m, df_d, df_q)
    except Exception as e:
        import traceback

        traceback.print_exc()
        print(f"Failed to load data to the database: {e}")
        print("Please ensure docker-compose up -d has been run to start Postgres.")


if __name__ == "__main__":
    main()

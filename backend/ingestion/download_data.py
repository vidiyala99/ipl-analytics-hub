import os
import requests
import zipfile
import io

# URL for Indian Premier League JSON data
URL = "https://cricsheet.org/downloads/ipl_json.zip"

def download_and_extract(url, extract_to):
    print(f"Downloading data from {url}...")
    response = requests.get(url)
    response.raise_for_status()

    # Extract the zip file
    print(f"Extracting to {extract_to}...")
    with zipfile.ZipFile(io.BytesIO(response.content)) as z:
        z.extractall(extract_to)
    print("Download and extraction complete.")

if __name__ == "__main__":
    # The script should be run from ipl-platform root, or adjust path accordingly
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        
    download_and_extract(URL, data_dir)

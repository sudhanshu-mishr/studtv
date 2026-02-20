import kagglehub
import pandas as pd
import json
import os

def process_dataset():
    print("Downloading dataset...")
    try:
        path = kagglehub.dataset_download("asaniczka/tmdb-movies-dataset-2023-930k-movies")
        print("Dataset downloaded to:", path)

        # Find the CSV file
        csv_file = None
        for file in os.listdir(path):
            if file.endswith(".csv"):
                csv_file = os.path.join(path, file)
                break

        if not csv_file:
            print("No CSV file found in dataset.")
            return

        print(f"Processing {csv_file}...")
        df = pd.read_csv(csv_file)

        # Filter for quality movies
        # Criteria: Released, English, High Vote Count, Good Rating
        df = df[
            (df['status'] == 'Released') &
            (df['original_language'] == 'en') &
            (df['vote_count'] > 500) &
            (df['vote_average'] > 6.0) &
            (df['poster_path'].notna())
        ]

        # Sort by popularity or vote count to get the "best" ones
        df = df.sort_values(by='popularity', ascending=False)

        # Take top 2000 to keep JSON manageable but vast
        df = df.head(2000)

        movies = []
        for _, row in df.iterrows():
            # Genre parsing (dataset usually has string "Action, Drama")
            # We need IDs to match our frontend logic if possible, or we adapt frontend.
            # Our frontend expects 'genre_ids' (list of ints).
            # The dataset likely has 'genres' as string "Action, Comedy".
            # We can map them or just use a simple list of strings if we change frontend,
            # BUT to minimize frontend changes, let's map common names to TMDB IDs or just mock it.
            # Better approach: The frontend uses IDs for filtering.
            # Let's try to map names to IDs based on our DEFAULT_GENRES in script.js.

            genre_map = {
                'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
                'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
                'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
                'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
                'TV Movie': 10770, 'Thriller': 53, 'War': 10752, 'Western': 37
            }

            genre_ids = []
            if isinstance(row.get('genres'), str):
                names = row['genres'].split(', ')
                for name in names:
                    if name in genre_map:
                        genre_ids.append(genre_map[name])

            movie = {
                "id": int(row['id']),
                "title": row['title'],
                "poster_path": row['poster_path'],
                "backdrop_path": row.get('backdrop_path'),
                "vote_average": float(row['vote_average']),
                "release_date": row['release_date'],
                "overview": row['overview'],
                "genre_ids": genre_ids,
                "media_type": "movie" # This dataset is movies only
            }
            movies.append(movie)

        # Append existing TV shows from previous manual entry if we want to keep them
        # Let's read the current movies.json to preserve TV shows
        current_data = []
        if os.path.exists('movies.json'):
            try:
                with open('movies.json', 'r') as f:
                    current_data = json.load(f)
            except:
                pass

        # Filter out movies from current_data (since we are replacing them with bulk data)
        # BUT keep TV shows
        tv_shows = [item for item in current_data if item.get('media_type') == 'tv']

        final_list = movies + tv_shows

        # Shuffle slightly or sort? Let's keep popularity sort for movies, then TV.
        # Actually, let's just save.

        print(f"Saving {len(final_list)} items to movies.json...")
        with open('movies.json', 'w') as f:
            json.dump(final_list, f, indent=2)

        print("Done!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    process_dataset()

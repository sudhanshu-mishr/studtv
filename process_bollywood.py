import kagglehub
import pandas as pd
import json
import os

def process_bollywood():
    print("Downloading Bollywood dataset...")
    try:
        # 1. Download Bollywood List
        bolly_path = kagglehub.dataset_download("noorunnishabegum1996/top-1000-bollywood-movies-and-their-boxoffice")
        print("Bollywood Dataset downloaded to:", bolly_path)

        bolly_csv = None
        for root, dirs, files in os.walk(bolly_path):
            for file in files:
                if file.endswith(".csv"):
                    bolly_csv = os.path.join(root, file)
                    break

        if not bolly_csv:
            print("No CSV file found for Bollywood dataset.")
            return

        df_bolly = pd.read_csv(bolly_csv)
        print(f"Loaded {len(df_bolly)} Bollywood movies.")

        # 2. Download/Load Large TMDB Dataset for Lookup (The 930k one)
        print("Ensuring TMDB 930k dataset is available for lookup...")
        tmdb_path = kagglehub.dataset_download("asaniczka/tmdb-movies-dataset-2023-930k-movies")

        tmdb_csv = None
        for root, dirs, files in os.walk(tmdb_path):
            for file in files:
                if file.endswith(".csv"):
                    tmdb_csv = os.path.join(root, file)
                    break

        if not tmdb_csv:
            print("No CSV file found for TMDB dataset.")
            return

        # Optimization: Read chunks or specific cols?
        # We need Title and ID and Metadata.
        # Reading 930k rows might take memory, but 200MB is fine for this env.
        print("Loading TMDB lookup table...")
        df_tmdb = pd.read_csv(tmdb_csv, usecols=['id', 'title', 'original_title', 'poster_path', 'vote_average', 'release_date', 'overview', 'genres', 'backdrop_path'])

        # Create Lookup Dictionary: Title -> Data
        # Normalize titles: lowercase, strip
        print("Building lookup index...")
        lookup = {}
        for _, row in df_tmdb.iterrows():
            if pd.notna(row['title']):
                norm_title = str(row['title']).lower().strip()
                # Prioritize movies with posters
                if pd.notna(row['poster_path']):
                    lookup[norm_title] = row

            # Also map original_title (often Hindi title in latin script)
            if pd.notna(row['original_title']):
                norm_orig = str(row['original_title']).lower().strip()
                if pd.notna(row['poster_path']):
                    lookup[norm_orig] = row

        # 3. Match Bollywood Movies
        new_movies = []
        genre_map = {
            'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
            'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
            'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
            'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
            'TV Movie': 10770, 'Thriller': 53, 'War': 10752, 'Western': 37
        }

        matched_count = 0
        for _, row in df_bolly.iterrows():
            # Column likely 'Movie Name' or similar
            # Check columns
            title_col = 'Movie Name' if 'Movie Name' in df_bolly.columns else df_bolly.columns[0] # Fallback

            title = str(row.get(title_col, '')).strip()
            norm_title = title.lower()

            if norm_title in lookup:
                tmdb_row = lookup[norm_title]

                # Genre Parsing
                g_ids = []
                raw_genres = str(tmdb_row.get('genres', ''))
                if raw_genres:
                    names = raw_genres.split(', ')
                    for name in names:
                        if name in genre_map:
                            g_ids.append(genre_map[name])

                movie = {
                    "id": int(tmdb_row['id']),
                    "title": str(tmdb_row['title']),
                    "poster_path": str(tmdb_row['poster_path']),
                    "backdrop_path": str(tmdb_row['backdrop_path']) if pd.notna(tmdb_row['backdrop_path']) else None,
                    "vote_average": float(tmdb_row['vote_average']),
                    "release_date": str(tmdb_row['release_date']),
                    "overview": str(tmdb_row['overview']),
                    "genre_ids": g_ids,
                    "media_type": "movie"
                }
                new_movies.append(movie)
                matched_count += 1

        print(f"Matched {matched_count} Bollywood movies to TMDB records.")

        # 4. Merge with existing movies.json
        existing_movies = []
        if os.path.exists('movies.json'):
            with open('movies.json', 'r') as f:
                existing_movies = json.load(f)

        print(f"Current library size: {len(existing_movies)}")

        # Merge
        movie_map = {m['id']: m for m in existing_movies}
        added = 0
        for m in new_movies:
            if m['id'] not in movie_map:
                movie_map[m['id']] = m
                added += 1

        final_list = list(movie_map.values())
        final_list.sort(key=lambda x: x.get('vote_average', 0), reverse=True)

        print(f"Added {added} unique Bollywood movies.")
        print(f"Final library size: {len(final_list)}")

        with open('movies.json', 'w') as f:
            json.dump(final_list, f, indent=2)

        print("Updated movies.json")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    process_bollywood()

import kagglehub
import pandas as pd
import json
import os

def process_dataset():
    print("Downloading new dataset...")
    try:
        path = kagglehub.dataset_download("shraddha4ever20/top-rated-movies-from-tmdb-19902025")
        print("Dataset downloaded to:", path)

        # Find CSV
        csv_file = None
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith(".csv"):
                    csv_file = os.path.join(root, file)
                    break
            if csv_file: break

        if not csv_file:
            print("No CSV file found.")
            return

        print(f"Processing {csv_file}...")
        df = pd.read_csv(csv_file)

        # Display sample to confirm column names
        print("Columns found:", df.columns.tolist())

        # Map Columns
        # Expected from previous observation: id, title, vote_average, vote_count, release_date, poster_path, backdrop_path, overview, genre_ids (or genres)

        new_movies = []
        genre_map = {
            'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
            'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
            'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
            'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
            'TV Movie': 10770, 'Thriller': 53, 'War': 10752, 'Western': 37
        }

        for _, row in df.iterrows():
            try:
                # Basic validation
                if pd.isna(row.get('title')) or pd.isna(row.get('id')):
                    continue

                # Genre Parsing
                # The dataset likely has genres as a string list representation "['Drama', 'Romance']" or "Drama, Romance"
                g_ids = []
                raw_genres = str(row.get('genre_ids', row.get('genres', '')))

                # Cleanup string list representation if present
                clean_genres = raw_genres.replace('[','').replace(']','').replace("'", "").replace('"', "")
                genre_names = [g.strip() for g in clean_genres.split(',')]

                for name in genre_names:
                    if name in genre_map:
                        g_ids.append(genre_map[name])

                # Construct Movie Object
                movie = {
                    "id": int(row['id']),
                    "title": str(row['title']),
                    "poster_path": str(row['poster_path']) if pd.notna(row.get('poster_path')) else None,
                    "backdrop_path": str(row['backdrop_path']) if pd.notna(row.get('backdrop_path')) else None,
                    "vote_average": float(row.get('vote_average', 0)),
                    "release_date": str(row.get('release_date', '')),
                    "overview": str(row.get('overview', '')),
                    "genre_ids": g_ids,
                    "media_type": "movie"
                }
                new_movies.append(movie)
            except Exception as e:
                # Skip malformed rows
                continue

        print(f"Extracted {len(new_movies)} movies from new dataset.")

        # Load Existing Data
        existing_movies = []
        if os.path.exists('movies.json'):
            with open('movies.json', 'r') as f:
                existing_movies = json.load(f)

        print(f"Existing library size: {len(existing_movies)}")

        # Merge Strategy:
        # Create a dict by ID for existing movies to preserve manual edits or specific attributes
        # Then update/add with new data.
        # Actually, let's prioritize existing data if it's curated, BUT this new dataset is 'top rated'.
        # Let's add new movies if ID doesn't exist.

        movie_map = {m['id']: m for m in existing_movies}

        added_count = 0
        for m in new_movies:
            if m['id'] not in movie_map:
                movie_map[m['id']] = m
                added_count += 1
            else:
                # Optional: Update rating or poster if missing in existing?
                # Let's keep existing to be safe.
                pass

        final_list = list(movie_map.values())

        # Optional: Sort by popularity or vote average to put best content first in JSON (though JS handles sort)
        # Let's sort by vote_average descending for quality
        final_list.sort(key=lambda x: x.get('vote_average', 0), reverse=True)

        print(f"Added {added_count} new movies.")
        print(f"Final library size: {len(final_list)}")

        with open('movies.json', 'w') as f:
            json.dump(final_list, f, indent=2)

        print("Successfully updated movies.json")

    except Exception as e:
        print(f"Critical Error: {e}")

if __name__ == "__main__":
    process_dataset()
